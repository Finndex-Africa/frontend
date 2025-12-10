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

    const serverClient = getServerClient();

    // Upsert users first to ensure they exist in Stream
    await serverClient.upsertUser({ id: clientId });
    await serverClient.upsertUser({ id: landlordId });

    // Create a unique channel ID (max 64 characters)
    const channelId = createChannelId(propertyId, clientId, landlordId);

    // Create or get the channel
    const channel = serverClient.channel('messaging', channelId, {
      members: [clientId, landlordId],
      created_by_id: clientId,
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
