type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMessage(payload: ContactPayload) {
  const to = process.env.CONTACT_TO_EMAIL?.trim() ?? "suporte@roccius.com.br";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ?? "onboarding@resend.dev";
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false as const,
      message:
        "Canal de contato não configurado. Envie um e-mail para suporte@roccius.com.br.",
    };
  }

  const body = [
    `Nome: ${payload.name}`,
    `E-mail: ${payload.email}`,
    `Assunto: ${payload.subject}`,
    "",
    payload.message,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ROCCIUS <${from}>`,
        to: [to],
        reply_to: payload.email,
        subject: `[ROCCIUS Contato] ${payload.subject}`,
        text: body,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend contact error:", details);
      return {
        ok: false as const,
        message: "Não foi possível enviar sua mensagem agora. Tente novamente.",
      };
    }

    return {
      ok: true as const,
      message: "Mensagem enviada com sucesso. Responderemos em até 24 horas úteis.",
    };
  } catch (error) {
    console.error("Contact send failed:", error);
    return {
      ok: false as const,
      message: "Erro ao enviar mensagem. Tente novamente em instantes.",
    };
  }
}