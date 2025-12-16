import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  process.env.STREAM_KEY!,
  process.env.STREAM_SECRET!
);

async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result.data || result;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  return null;
}

export async function POST(req: Request) {
  const { userId, userName, userImage } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // If name and image not provided, fetch user data
  let finalUserName = userName;
  let finalUserImage = userImage;

  if (!finalUserName || !finalUserImage) {
    const userData = await fetchUserData(userId);
    if (userData) {
      finalUserName = finalUserName ||
        `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
        userData.email?.split('@')[0] ||
        'User';
      finalUserImage = finalUserImage || userData.avatar;
    }
  }

  // Upsert user in Stream with name and image
  await serverClient.upsertUser({
    id: userId,
    name: finalUserName || userId,
    image: finalUserImage,
  });

  const token = serverClient.createToken(userId);

  return NextResponse.json({ token });
}
