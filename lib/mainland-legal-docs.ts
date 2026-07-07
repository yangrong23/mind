export type MainlandLegalDocId =
  | "privacyPolicy"
  | "termsOfService"
  | "deleteAccount"
  | "support"
  | "contact"
  | "companyInfo"

export type MainlandLegalSection = {
  heading: string
  paragraphs: string[]
}

export type MainlandLegalDocument = {
  id: MainlandLegalDocId
  title: string
  lastUpdated: string
  sections: MainlandLegalSection[]
}

export const MAINLAND_LEGAL_DOCUMENTS: Record<MainlandLegalDocId, MainlandLegalDocument> = {
  privacyPolicy: {
    id: "privacyPolicy",
    title: "Privacy Policy",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Who operates Medrix Mind",
        paragraphs: [
          "Medrix Mind is operated by 璨辰科技（深圳）有限公司 (Canchen Technology (Shenzhen) Co., Ltd.). You can contact us at mindar2@medrixai.com.",
          "Unified Social Credit Code: 91440300MAEU5J6G82. D-U-N-S Number: 517563518.",
        ],
      },
      {
        heading: "Information we collect",
        paragraphs: [
          "Depending on how you use the product, we may process account information such as name, email address, authentication details, workspace membership, and support messages.",
          "We may also process user-provided content, including notes, audio recordings, transcripts, uploaded documents, prompts, generated summaries, decisions, tags, and related workspace metadata.",
          "To keep the service reliable, we may collect technical information such as device type, app version, operating system, IP-derived region, crash logs, diagnostics, and usage events.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use information to provide the service, generate AI-assisted summaries and answers, maintain user accounts, synchronize content across devices, improve reliability, respond to support requests, prevent abuse, and meet legal obligations.",
          "We do not sell personal information. We do not use workspace content for advertising.",
        ],
      },
      {
        heading: "AI processing",
        paragraphs: [
          "Medrix Mind may send prompts, files, notes, transcripts, and related context to trusted AI and infrastructure providers so the product can generate summaries, evidence packs, recommendations, and answers. We limit this processing to what is needed to provide the requested product experience.",
          "AI output may be inaccurate or incomplete. Users should review generated content before relying on it for business, research, legal, medical, financial, or other important decisions.",
        ],
      },
      {
        heading: "Sharing and service providers",
        paragraphs: [
          "We may share information with vendors who help us host, secure, analyze, support, and operate Medrix Mind. These providers are authorized to process information only for the purposes described in this policy and under appropriate confidentiality and security terms.",
          "We may disclose information if required by law, to protect rights and safety, or as part of a corporate transaction such as a merger, acquisition, or financing.",
        ],
      },
      {
        heading: "Retention and deletion",
        paragraphs: [
          "We retain account and workspace content while your account is active or as needed to provide the service. You can request deletion through the account deletion page or by contacting support.",
          "Some records may be retained for a limited period where required for security, fraud prevention, tax, accounting, dispute resolution, or other legal obligations.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We use administrative, technical, and organizational safeguards designed to protect information against unauthorized access, loss, misuse, or alteration. No online service can guarantee absolute security.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "Medrix Mind is not intended for children under 13 or for users below the minimum age required in their jurisdiction. We do not knowingly collect personal information from children.",
        ],
      },
      {
        heading: "International use",
        paragraphs: [
          "If you use Medrix Mind from outside the location where our service providers operate, your information may be transferred to and processed in other countries. We take steps designed to protect information in accordance with this policy.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For privacy questions, data access requests, correction requests, or deletion requests, contact mindar2@medrixai.com.",
          "Registered office: F919, Podium, Building 12A, Shenzhen Bay Science and Technology Ecological Park, No. 18 Keji South Road, High-Tech Zone Community, Yuehai Subdistrict, Nanshan District, Shenzhen, Guangdong, China",
          "深圳市南山区粤海街道高新区社区科技南路18号深圳湾科技生态园12栋A座裙楼F919",
          "Phone: +86 157 9795 7225.",
        ],
      },
    ],
  },
  termsOfService: {
    id: "termsOfService",
    title: "Terms of Service",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "These terms govern access to and use of Medrix Mind, including the website, mobile apps, and related services.",
        ],
      },
      {
        heading: "Operator",
        paragraphs: [
          'Medrix Mind is operated by 璨辰科技（深圳）有限公司 (Canchen Technology (Shenzhen) Co., Ltd.). References to "Medrix," "Mind," "we," "our," or "us" mean 璨辰科技（深圳）有限公司.',
          "Unified Social Credit Code: 91440300MAEU5J6G82. D-U-N-S Number: 517563518.",
        ],
      },
      {
        heading: "Use of the service",
        paragraphs: [
          "You may use Medrix Mind only in compliance with these terms, applicable laws, and any product instructions we provide. You are responsible for the accuracy, legality, and permissions for content you upload or process through the service.",
          "You may not use the service to infringe rights, reverse engineer the product, compromise security, overload infrastructure, transmit malware, or process content that you do not have the right to use.",
        ],
      },
      {
        heading: "Workspace content",
        paragraphs: [
          "You retain ownership of content you submit to Medrix Mind. You grant us the limited rights needed to host, process, transmit, display, and analyze that content to provide and improve the service.",
          "If you use Medrix Mind on behalf of an organization, you confirm that you have authority to submit organization content and manage the relevant workspace.",
        ],
      },
      {
        heading: "AI-generated output",
        paragraphs: [
          "Medrix Mind uses AI to help summarize, search, organize, and reason over information. Output may contain errors, omissions, or unsupported assumptions. You are responsible for reviewing output before using it.",
          "Medrix Mind is not a medical device, clinical decision support system, diagnostic service, legal service, financial advisory service, or substitute for professional judgment.",
        ],
      },
      {
        heading: "Accounts and security",
        paragraphs: [
          "You are responsible for maintaining the confidentiality of your account credentials and for activity under your account. Notify us promptly if you believe your account has been compromised.",
        ],
      },
      {
        heading: "Availability and changes",
        paragraphs: [
          "We may update, suspend, or discontinue parts of the service from time to time. We aim to provide a reliable product, but we do not guarantee uninterrupted or error-free operation.",
        ],
      },
      {
        heading: "Termination",
        paragraphs: [
          "You may stop using Medrix Mind at any time. We may suspend or terminate access if we believe you violated these terms, created security or legal risk, or misused the service.",
        ],
      },
      {
        heading: "Disclaimers and limitation of liability",
        paragraphs: [
          'The service is provided "as is" and "as available." To the maximum extent permitted by law, we disclaim implied warranties and will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages.',
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these terms can be sent to mindar2@medrixai.com.",
          "Registered office: F919, Podium, Building 12A, Shenzhen Bay Science and Technology Ecological Park, No. 18 Keji South Road, High-Tech Zone Community, Yuehai Subdistrict, Nanshan District, Shenzhen, Guangdong, China",
          "深圳市南山区粤海街道高新区社区科技南路18号深圳湾科技生态园12栋A座裙楼F919",
          "Phone: +86 157 9795 7225.",
        ],
      },
    ],
  },
  deleteAccount: {
    id: "deleteAccount",
    title: "Delete Account",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "Medrix Mind users can request account deletion and removal of associated personal data.",
        ],
      },
      {
        heading: "Delete your account in the app",
        paragraphs: [
          "Open Medrix Mind and go to Settings, then Account, then Delete Account. Follow the confirmation steps shown in the app.",
          'If you cannot access the app, email mindar2@medrixai.com from the email address associated with your account and include "Delete Account" in the subject line.',
        ],
      },
      {
        heading: "What will be deleted",
        paragraphs: [
          "Deletion removes your account profile and personal workspace content associated with the account, including notes, transcripts, uploaded documents, AI-generated summaries, and workspace metadata where applicable.",
          "If you belong to an organization workspace, some shared workspace content may remain under that organization's control unless the organization requests its deletion or your account is the sole owner.",
        ],
      },
      {
        heading: "What may be retained",
        paragraphs: [
          "We may retain limited records when required for security, fraud prevention, legal compliance, accounting, dispute resolution, or enforcement of our terms. Retained records are kept only as long as needed for those purposes.",
        ],
      },
      {
        heading: "Processing time",
        paragraphs: [
          "We aim to complete verified deletion requests within 30 days unless a longer period is required by law or necessary to verify account ownership.",
        ],
      },
      {
        heading: "Need help",
        paragraphs: ["Contact mindar2@medrixai.com for deletion questions or account access issues."],
      },
    ],
  },
  support: {
    id: "support",
    title: "Support",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "Get help with Medrix Mind accounts, product questions, privacy requests, and technical issues.",
        ],
      },
      {
        heading: "Support topics",
        paragraphs: [
          "Product help: Questions about notes, transcripts, knowledge bases, AI answers, workspace setup, or app behavior.",
          "Account and privacy: Access requests, account deletion, data concerns, login issues, or security questions.",
          "Response time: We aim to respond to support requests within two business days.",
          "Direct contact: Company phone, registered office, and organization identifiers are listed below for formal requests.",
        ],
      },
      {
        heading: "Email support",
        paragraphs: [
          "For user support, contact mindar2@medrixai.com. Please include the email address on your account, app version, device model, and a short description of the issue.",
          "For developer or organization verification questions, contact mindar2@medrixai.com.",
        ],
      },
      {
        heading: "Phone and registered office",
        paragraphs: [
          "Phone: +86 157 9795 7225",
          "Registered office: F919, Podium, Building 12A, Shenzhen Bay Science and Technology Ecological Park, No. 18 Keji South Road, High-Tech Zone Community, Yuehai Subdistrict, Nanshan District, Shenzhen, Guangdong, China",
          "深圳市南山区粤海街道高新区社区科技南路18号深圳湾科技生态园12栋A座裙楼F919",
          "Unified Social Credit Code: 91440300MAEU5J6G82",
          "D-U-N-S Number: 517563518",
        ],
      },
      {
        heading: "Before contacting support",
        paragraphs: [
          "Try updating to the latest version of the app and restarting your device.",
          "If the issue involves generated content, include the workspace or note title and the time the problem occurred. Do not send sensitive content unless it is necessary for support.",
        ],
      },
      {
        heading: "Security concerns",
        paragraphs: [
          'If you believe you found a security issue or your account may be compromised, email mindar2@medrixai.com with "Security" in the subject line.',
        ],
      },
    ],
  },
  contact: {
    id: "contact",
    title: "Contact",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Legal entity",
        paragraphs: ["璨辰科技（深圳）有限公司", "Canchen Technology (Shenzhen) Co., Ltd."],
      },
      {
        heading: "Company identifiers",
        paragraphs: [
          "Unified Social Credit Code: 91440300MAEU5J6G82",
          "D-U-N-S: 517563518",
        ],
      },
      {
        heading: "Website",
        paragraphs: ["fari.ai", "https://fari.ai"],
      },
      {
        heading: "Email contact",
        paragraphs: ["mindar2@medrixai.com"],
      },
      {
        heading: "Phone",
        paragraphs: ["+86 157 9795 7225"],
      },
      {
        heading: "Product",
        paragraphs: [
          "Medrix Mind is an AI-powered workspace intelligence product that helps teams turn past meetings, interviews, notes, and documents into usable context for current work.",
        ],
      },
      {
        heading: "Contact emails",
        paragraphs: [
          "User support: mindar2@medrixai.com",
          "Developer and organization verification: mindar2@medrixai.com",
        ],
      },
      {
        heading: "Registered office",
        paragraphs: [
          "F919, Podium, Building 12A, Shenzhen Bay Science and Technology Ecological Park, No. 18 Keji South Road, High-Tech Zone Community, Yuehai Subdistrict, Nanshan District, Shenzhen, Guangdong, China",
          "深圳市南山区粤海街道高新区社区科技南路18号深圳湾科技生态园12栋A座裙楼F919",
          "Phone: +86 157 9795 7225",
        ],
      },
      {
        heading: "Company information",
        paragraphs: [
          "This website is published for Medrix Mind and identifies the operating company, product contact, privacy policy, terms of service, support process, and account deletion process. The official website domain is fari.ai.",
        ],
      },
    ],
  },
  companyInfo: {
    id: "companyInfo",
    title: "Company Information",
    lastUpdated: "June 12, 2026",
    sections: [
      {
        heading: "Company profile",
        paragraphs: [
          "Product name: Medrix Mind",
          "Legal entity name: 璨辰科技（深圳）有限公司",
          "English legal name: Canchen Technology (Shenzhen) Co., Ltd.",
          "Company type: 有限责任公司",
          "Unified Social Credit Code: 91440300MAEU5J6G82",
          "D-U-N-S Number: 517563518",
          "Website domain: fari.ai",
          "Website URL: https://fari.ai",
          "Support email: mindar2@medrixai.com",
          "Developer / organization verification email: mindar2@medrixai.com",
        ],
      },
      {
        heading: "Registered office",
        paragraphs: [
          "Registered office, Chinese: 深圳市南山区粤海街道高新区社区科技南路18号深圳湾科技生态园12栋A座裙楼F919",
          "Registered office, English: F919, Podium, Building 12A, Shenzhen Bay Science and Technology Ecological Park, No. 18 Keji South Road, High-Tech Zone Community, Yuehai Subdistrict, Nanshan District, Shenzhen, Guangdong, China",
          "Phone: +86 157 9795 7225",
          "Last updated on website: June 12, 2026",
        ],
      },
    ],
  },
}

export function getMainlandLegalDocument(id: MainlandLegalDocId): MainlandLegalDocument {
  return MAINLAND_LEGAL_DOCUMENTS[id]
}
