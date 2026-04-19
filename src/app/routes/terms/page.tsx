import type { Metadata } from 'next';
import Link from 'next/link';
import { BulletList, LegalContactCard, LegalDocLayout, LegalSection, LegalSubheading } from '../../../components/legal/LegalDocLayout';

export const metadata: Metadata = {
    title: 'Terms & Conditions | FindAfriq',
    description: 'Terms governing your use of the FindAfriq platform.',
};

export default function TermsPage() {
    return (
        <LegalDocLayout
            title="FindAfriq Terms and Conditions"
            subtitle="Welcome to FindAfriq. These Terms govern your access to and use of the FindAfriq platform."
        >
            <LegalSection title="Introduction">
                <p>
                    These Terms and Conditions (“Terms”) govern your access to and use of the FindAfriq platform,
                    including our website, services, and applications (collectively, the “Platform”). By accessing or using
                    FindAfriq, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
                </p>
            </LegalSection>

            <LegalSection title="1. About FindAfriq">
                <p>FindAfriq is a digital platform that connects:</p>
                <BulletList items={['Landlord', 'Real estate agents', 'Home seekers', 'Service providers']} />
                <p>We facilitate listings, visibility, and connections but do not act as a direct party in transactions.</p>
            </LegalSection>

            <LegalSection title="2. User eligibility">
                <p>To use FindAfriq, you must:</p>
                <BulletList
                    items={[
                        'Be at least 18 years old',
                        'Provide accurate and complete information',
                        'Use the platform in compliance with applicable laws',
                    ]}
                />
            </LegalSection>

            <LegalSection title="3. User categories">
                <LegalSubheading>a. Landlord &amp; agents</LegalSubheading>
                <BulletList
                    items={[
                        'Can post property listings under selected packages',
                        'Responsible for accuracy of listings',
                        'Must ensure properties are legitimate and available',
                    ]}
                />
                <LegalSubheading>b. Home seekers</LegalSubheading>
                <BulletList
                    items={[
                        'Can browse listings and contact agents',
                        'Pay a one-time platform authorization fee based on property size',
                        'Pay agents directly for services (FindAfriq does not collect commissions)',
                    ]}
                />
                <LegalSubheading>c. Service providers</LegalSubheading>
                <BulletList
                    items={[
                        'Subscribe to access the platform',
                        'Receive customer inquiries and visibility',
                        'Must provide genuine and professional services',
                    ]}
                />
            </LegalSection>

            <LegalSection title="4. Pricing &amp; payments">
                <LegalSubheading>4.1 Property listing fees</LegalSubheading>
                <BulletList
                    items={['Basic, Pro, and Premium packages available', 'Payments are non-refundable once listing is published']}
                />
                <LegalSubheading>4.2 Platform authorization fee</LegalSubheading>
                <BulletList
                    items={[
                        'Paid by home seekers based on property size',
                        'This fee grants access to agent services via the platform',
                        'This is not a rental payment or commission',
                    ]}
                />
                <LegalSubheading>4.3 Service provider subscription</LegalSubheading>
                <BulletList
                    items={[
                        'Subscription plans (Basic, Pro, Premium) are time-based',
                        'Services are active only within the subscription duration',
                        'No refunds for unused subscription periods',
                    ]}
                />
                <p className="text-sm text-gray-600">
                    Details:{' '}
                    <Link href="/routes/pricing" className="text-[#0000FF] font-medium hover:underline">
                        Pricing model
                    </Link>
                    .
                </p>
            </LegalSection>

            <LegalSection title="5. Platform role &amp; limitations">
                <p>FindAfriq:</p>
                <BulletList
                    items={[
                        'Does not own, manage, or inspect properties',
                        'Does not guarantee the accuracy of listings',
                        'Is not responsible for agreements between users',
                        'Does not handle rental or service payments between users',
                    ]}
                />
            </LegalSection>

            <LegalSection title="6. User responsibilities">
                <p>All users agree to:</p>
                <BulletList
                    items={[
                        'Provide truthful and accurate information',
                        'Avoid fraudulent, misleading, or illegal activities',
                        'Respect other users’ rights and privacy',
                    ]}
                />
                <p className="font-medium text-gray-900">Prohibited actions include:</p>
                <BulletList
                    items={[
                        'Posting fake listings',
                        'Scamming or misrepresentation',
                        'Harassment or abuse',
                        'Unauthorized commercial use',
                    ]}
                />
            </LegalSection>

            <LegalSection title="7. Verification &amp; trust">
                <p>FindAfriq may:</p>
                <BulletList items={['Verify certain users or listings', 'Provide “Verified” badges']} />
            </LegalSection>

            <LegalSection title="8. Listings &amp; content">
                <p>Users are responsible for:</p>
                <BulletList items={['All content uploaded (images, descriptions, pricing)', 'Ensuring content does not violate laws or rights']} />
                <p>FindAfriq reserves the right to:</p>
                <BulletList items={['Remove or edit content', 'Suspend accounts violating policies']} />
            </LegalSection>

            <LegalSection title="9. Transactions between users">
                <BulletList
                    items={[
                        'All negotiations and agreements occur outside the platform',
                        'FindAfriq is not liable for disputes, losses, or damages',
                        'Users are encouraged to document agreements properly',
                        'Users should report any misconduct to FindAfriq',
                    ]}
                />
            </LegalSection>

            <LegalSection title="10. Cancellation &amp; termination">
                <p>FindAfriq may:</p>
                <BulletList items={['Suspend or terminate accounts for violations', 'Remove listings without notice']} />
                <p>Users may stop using the platform at any time.</p>
            </LegalSection>

            <LegalSection title="11. Limitation of liability">
                <p>FindAfriq is not liable for:</p>
                <BulletList
                    items={[
                        'Fraudulent listings or users',
                        'Property condition or availability',
                        'Financial losses from transactions',
                        'Service quality from providers',
                    ]}
                />
            </LegalSection>

            <LegalSection title="12. Privacy">
                <p>
                    Your use of FindAfriq is also governed by our{' '}
                    <Link href="/routes/privacy" className="text-[#0000FF] font-medium hover:underline">
                        Privacy Policy
                    </Link>
                    . We are committed to protecting your data.
                </p>
            </LegalSection>

            <LegalSection title="13. Intellectual property">
                <p>
                    All platform content, branding, and materials belong to FindAfriq. Users may not copy, reproduce, or
                    distribute without permission.
                </p>
            </LegalSection>

            <LegalSection title="14. Modifications to terms">
                <p>
                    FindAfriq reserves the right to update these Terms at any time. Continued use of the platform means you
                    accept the updated Terms.
                </p>
            </LegalSection>

            <LegalSection title="15. Governing law">
                <p>These Terms shall be governed by the laws of the jurisdiction where FindAfriq operates.</p>
            </LegalSection>

            <LegalSection title="16. Contact information">
                <p>For questions or support, contact:</p>
                <p className="font-semibold text-gray-900">FindAfriq</p>
                <ul className="list-none space-y-1 text-gray-700 pl-0">
                    <li>
                        Email:{' '}
                        <a href="mailto:findafriq@gmail.com" className="text-[#0000FF] font-medium hover:underline">
                            findafriq@gmail.com
                        </a>
                    </li>
                    <li>
                        Website:{' '}
                        <a href="https://www.findafriq.com" className="text-[#0000FF] font-medium hover:underline">
                            www.findafriq.com
                        </a>
                    </li>
                    <li>Phone: +231 779 922 382 | WhatsApp: +231 886 149 219</li>
                </ul>
            </LegalSection>

            <LegalSection title="17. Acceptance">
                <p>
                    By using FindAfriq, you acknowledge that you have read, understood, and agreed to these Terms and
                    Conditions.
                </p>
            </LegalSection>

            <div className="flex flex-wrap gap-3 text-sm">
                <Link
                    href="/routes/platform-policy"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                >
                    Platform policy
                </Link>
                <Link
                    href="/routes/privacy"
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                >
                    Privacy policy
                </Link>
            </div>

            <LegalContactCard />
        </LegalDocLayout>
    );
}
