import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await request.json();

    return NextResponse.json({
      success: true,
      id,
      body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
