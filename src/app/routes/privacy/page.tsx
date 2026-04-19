import type { Metadata } from 'next';
import Link from 'next/link';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalSubheading,
} from '../../../components/legal/LegalDocLayout';

export const metadata: Metadata = {
    title: 'Privacy Policy | FindAfriq',
    description: 'How FindAfriq collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
    return (
        <LegalDocLayout
            title="Platform Privacy Policy"
            subtitle="How we handle personal information when you use FindAfriq."
        >
            <LegalSection title="1. Introduction">
                <p>
                    FindAfriq (“we”, “us”, “our”) respects your privacy. This Privacy Policy explains what information we
                    collect when you use our website and services (the “Platform”), how we use it, and the choices you
                    have. By using FindAfriq, you agree to this policy alongside our{' '}
                    <Link href="/routes/terms" className="text-[#0000FF] font-medium hover:underline">
                        Terms &amp; Conditions
                    </Link>
                    .
                </p>
            </LegalSection>

            <LegalSection title="2. Information we collect">
                <LegalSubheading>2.1 You provide</LegalSubheading>
                <BulletList
                    items={[
                        'Account details such as name, email address, phone number, and password.',
                        'Profile and listing information for landlords, agents, and service providers.',
                        'Messages you send through the Platform and support requests.',
                        'Payment-related information processed by our payment partners (we do not store full card numbers).',
                    ]}
                />
                <LegalSubheading>2.2 Automatically collected</LegalSubheading>
                <BulletList
                    items={[
                        'Device and browser type, IP address, and general location (e.g. region).',
                        'Usage data such as pages viewed, searches, and interactions to improve the Platform.',
                        'Cookies and similar technologies as described in our Cookie notice below.',
                    ]}
                />
            </LegalSection>

            <LegalSection title="3. How we use information">
                <BulletList
                    items={[
                        'To create and operate your account and provide Platform features.',
                        'To display listings, connect users, and facilitate communications.',
                        'To verify accounts or listings where applicable and to assign “Verified” badges.',
                        'To detect, prevent, and respond to fraud, abuse, and security incidents.',
                        'To communicate with you about updates, support, and (where permitted) marketing.',
                        'To comply with legal obligations and enforce our policies.',
                    ]}
                />
            </LegalSection>

            <LegalSection title="4. Legal bases (where applicable)">
                <p>
                    Depending on your region, we rely on consent, performance of a contract, legitimate interests (such
                    as securing the Platform and improving services), and legal obligations to process your data.
                </p>
            </LegalSection>

            <LegalSection title="5. Sharing and disclosure">
                <p>We do not sell your personal information. We may share data with:</p>
                <BulletList
                    items={[
                        'Service providers who help us host, analyze, secure, or operate the Platform.',
                        'Payment processors to complete transactions you authorize.',
                        'Professional advisers and authorities when required by law or to protect rights and safety.',
                        'Other users as needed to operate the Platform (for example, showing your contact details when you choose to connect with an agent or provider).',
                    ]}
                />
            </LegalSection>

            <LegalSection title="6. International transfers">
                <p>
                    If we transfer data across borders, we use appropriate safeguards (such as contracts or
                    recognized frameworks) consistent with applicable law.
                </p>
            </LegalSection>

            <LegalSection title="7. Retention">
                <p>
                    We retain information only as long as needed for the purposes above, including legal, accounting, and
                    dispute resolution. Listing and account data may be removed or anonymized when no longer required.
                </p>
            </LegalSection>

            <LegalSection title="8. Security">
                <p>
                    We implement technical and organizational measures to protect your data. No system is completely
                    secure; please use a strong password and protect your account credentials.
                </p>
            </LegalSection>

            <LegalSection title="9. Your rights">
                <p>
                    Depending on where you live, you may have rights to access, correct, delete, or restrict processing of
                    your personal data, and to object to certain processing or to lodge a complaint with a supervisory
                    authority. Contact us using the details below to exercise these rights.
                </p>
            </LegalSection>

            <LegalSection title="10. Cookies">
                <p>
                    We use cookies and similar technologies to remember preferences, understand usage, and improve
                    performance. You can control cookies through your browser settings; some features may not work if
                    cookies are disabled.
                </p>
            </LegalSection>

            <LegalSection title="11. Children">
                <p>
                    FindAfriq is not intended for children under 18. We do not knowingly collect personal information from
                    children.
                </p>
            </LegalSection>

            <LegalSection title="12. Third-party services">
                <p>
                    The Platform may link to third-party websites or services. Their privacy practices are governed by
                    their own policies. We are not responsible for third-party sites you visit outside FindAfriq.
                </p>
            </LegalSection>

            <LegalSection title="13. Changes to this policy">
                <p>
                    We may update this Privacy Policy from time to time. We will post the latest version on this page and
                    update the effective date as appropriate. Continued use of the Platform after changes means you
                    accept the updated policy.
                </p>
            </LegalSection>

            <LegalSection title="14. Contact">
                <p>
                    Questions about privacy:{' '}
                    <a href="mailto:findafriq@gmail.com" className="text-[#0000FF] font-medium hover:underline">
                        findafriq@gmail.com
                    </a>
                </p>
            </LegalSection>

            <LegalContactCard />
        </LegalDocLayout>
    );
}
