import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import crypto from 'crypto';

function getServerClient() {
  const apiKey = process.env.STREAM_KEY;
  const apiSecret = process.env.STREAM_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Stream API credentials not configured');
  }

  return StreamChat.getInstance(apiKey, apiSecret);
}

// Create a short hash for channel ID (max 64 chars)
function createChannelId(propertyId: string, clientId: string, landlordId: string): string {
  // Sort IDs to ensure consistent channel ID regardless of who initiates
  const sortedIds = [clientId, landlordId].sort();
  const combined = `${propertyId}-${sortedIds[0]}-${sortedIds[1]}`;

  // Always create a hash to ensure it's under 64 chars
  const hash = crypto.createHash('sha256').update(combined).digest('hex').substring(0, 40);
  return `p-${hash}`;
}

export async function POST(req: Request) {
  try {
    const { landlordId, clientId, propertyId } = await req.json();

    if (!landlordId || !clientId || !propertyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure IDs are strings (extract _id if objects are passed)
    const landlordIdStr = typeof landlordId === 'string' ? landlordId : landlordId._id || landlordId.id;
    const clientIdStr = typeof clientId === 'string' ? clientId : clientId._id || clientId.id;
    const propertyIdStr = typeof propertyId === 'string' ? propertyId : propertyId._id || propertyId.id;

    // Validate we have string IDs
    if (typeof landlordIdStr !== 'string' || typeof clientIdStr !== 'string' || typeof propertyIdStr !== 'string') {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Prevent users from chatting with themselves
    if (landlordIdStr === clientIdStr) {
      return NextResponse.json(
        { error: "Cannot create a chat with yourself" },
        { status: 400 }
      );
    }

    const serverClient = getServerClient();

    // Fetch user details from backend API
    async function fetchUserDetails(userId: string) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          return data.data || data;
        }
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
      }
      return null;
    }

    // Fetch both user details
    const [clientUser, landlordUser] = await Promise.all([
      fetchUserDetails(clientIdStr),
      fetchUserDetails(landlordIdStr),
    ]);

    // Upsert both users in Stream Chat to ensure they exist
    try {
      await serverClient.upsertUsers([
        {
          id: clientIdStr,
          name: clientUser?.firstName || clientUser?.name || 'User',
          image: clientUser?.avatar || undefined,
          role: 'user',
        },
        {
          id: landlordIdStr,
          name: landlordUser?.firstName || landlordUser?.name || 'Landlord',
          image: landlordUser?.avatar || undefined,
          role: 'user',
        },
      ]);
    } catch (error) {
      console.error('Error upserting users:', error);
      // Continue anyway - users might already exist
    }

    // First, try to find an existing channel between these two users
    try {
      const existingChannels = await serverClient.queryChannels({
        type: 'messaging',
        members: { $eq: [clientIdStr, landlordIdStr] },
      });

      // If we found an existing channel, use it
      if (existingChannels.length > 0) {
        console.log('Found existing channel:', existingChannels[0].id);
        return NextResponse.json({ channelId: existingChannels[0].id });
      }
    } catch (error) {
      console.log('No existing channel found, creating new one');
    }

    // Create a unique channel ID (max 64 characters)
    const channelId = createChannelId(propertyIdStr, clientIdStr, landlordIdStr);

    // Create or get the channel
    const channel = serverClient.channel('messaging', channelId, {
      members: [clientIdStr, landlordIdStr],
      created_by_id: clientIdStr,
    });

    // Create the channel if it doesn't exist, or get it if it does
    await channel.create();

    return NextResponse.json({ channelId });
  } catch (error: any) {
    console.error('Error creating chat channel:', error);

    // Provide more detailed error message
    const errorMessage = error?.message || 'Failed to create chat channel';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
