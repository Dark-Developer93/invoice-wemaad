import { NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { emailClient } from "@/lib/mailtrap";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    if (!session.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const sender = {
      email: process.env.EMAIL_FROM!,
      name: "Invoice WeMaAd",
    };

    emailClient.send({
      from: sender,
      to: [{ email: invoiceData.clientEmail }],
      template_uuid: "d6457c5f-5ec0-4be2-a674-a68dfa1e2cea",
      template_variables: {
        first_name: invoiceData.clientName,
        company_info_name: invoiceData.fromName,
        company_info_address: invoiceData.fromAddress,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send Email reminder", error);
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}
