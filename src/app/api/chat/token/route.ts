import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  process.env.STREAM_KEY!,
  process.env.STREAM_SECRET!
);

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const token = serverClient.createToken(userId);

  return NextResponse.json({ token });
}
