import type { Metadata } from 'next';
import Link from 'next/link';
import {
    BulletList,
    LegalContactCard,
    LegalDocLayout,
    LegalSection,
    LegalSubheading,
    PolicyTable,
} from '../../../components/legal/LegalDocLayout';

export const metadata: Metadata = {
    title: 'Platform Policy | FindAfriq',
    description: 'Rules governing use of the FindAfriq platform, enforcement, and penalties.',
};

export default function PlatformPolicyPage() {
    return (
        <LegalDocLayout
            title="FindAfriq Platform Policy"
            subtitle="Rules governing use of the platform, enforcement, and penalties for all users."
        >
            <LegalSection title="1. Purpose">
                <p>
                    This Policy outlines the rules governing the use of the FindAfriq platform and establishes clear
                    penalties for violations to ensure trust, safety, and professionalism across all users.
                </p>
            </LegalSection>

            <LegalSection title="2. Scope">
                <p>This policy applies to all users of FindAfriq, including:</p>
                <BulletList items={['Landlords', 'Real Estate Agents', 'Home Seekers', 'Service Providers']} />
            </LegalSection>

            <LegalSection title="3. Core platform principles">
                <p>All users must adhere to the following principles:</p>
                <BulletList
                    items={[
                        'Accuracy – Provide truthful and updated information',
                        'Transparency – No hidden or misleading details',
                        'Professionalism – Respectful communication and conduct',
                        'Legality – Compliance with all applicable laws',
                        'Integrity – No fraudulent or deceptive activities',
                    ]}
                />
            </LegalSection>

            <LegalSection title="4. Prohibited activities">
                <p>The following actions are strictly prohibited.</p>

                <LegalSubheading>4.1 Listings &amp; content violations</LegalSubheading>
                <BulletList
                    items={[
                        'Posting fake or non-existent properties',
                        'Uploading misleading descriptions, pricing, or images',
                        'Listing unavailable or already rented/sold properties',
                        'Using stolen or unauthorized images',
                    ]}
                />

                <LegalSubheading>4.2 Fraud &amp; misconduct</LegalSubheading>
                <BulletList
                    items={[
                        'Scamming or attempting to defraud users',
                        'Impersonation of agents, landlords, or businesses',
                        'Requesting unauthorized payments outside agreed terms',
                        'Manipulating platform fees or processes',
                    ]}
                />

                <LegalSubheading>4.3 User behavior violations</LegalSubheading>
                <BulletList
                    items={[
                        'Harassment, abuse, or threats',
                        'Discrimination or hate speech',
                        'Spamming or excessive unsolicited contact',
                    ]}
                />

                <LegalSubheading>4.4 Business &amp; platform abuse</LegalSubheading>
                <BulletList
                    items={[
                        'Unauthorized commercial use of the platform',
                        'Circumventing subscription or listing payments',
                        'Creating multiple accounts to bypass restrictions',
                    ]}
                />
            </LegalSection>

            <LegalSection title="5. Enforcement structure">
                <p>Violations are categorized into three levels based on severity:</p>
                <PolicyTable
                    headers={['Level', 'Description']}
                    rows={[
                        ['Level 1', 'Minor violations (warnings applicable)'],
                        ['Level 2', 'Moderate violations (temporary restrictions)'],
                        ['Level 3', 'Severe violations (permanent removal)'],
                    ]}
                />
            </LegalSection>

            <LegalSection title="6. Penalty framework">
                <LegalSubheading>6.1 Landlords &amp; agents</LegalSubheading>
                <PolicyTable
                    headers={['Violation', 'Penalty']}
                    rows={[
                        ['First-time inaccurate listing', 'Warning + listing removal'],
                        ['Repeated misleading listings', 'Account suspension (7–14 days)'],
                        ['Fake or fraudulent property', 'Immediate account termination'],
                        ['Refusal to update unavailable listing', 'Listing removal + warning'],
                        ['Scam involvement', 'Permanent ban + blacklisting'],
                    ]}
                />

                <LegalSubheading>6.2 Service providers</LegalSubheading>
                <PolicyTable
                    headers={['Violation', 'Penalty']}
                    rows={[
                        ['False business information', 'Warning + profile correction'],
                        ['Poor service complaints (verified)', 'Temporary suspension'],
                        ['Repeated misconduct', 'Subscription termination (no refund)'],
                        ['Fraud or scam activity', 'Permanent ban'],
                    ]}
                />

                <LegalSubheading>6.3 Home seekers</LegalSubheading>
                <PolicyTable
                    headers={['Violation', 'Penalty']}
                    rows={[
                        ['Misuse of agent contact access', 'Warning'],
                        ['Harassment of agents/providers', 'Account suspension'],
                        ['Fraudulent behavior', 'Permanent account ban'],
                    ]}
                />

                <LegalSubheading>6.4 General platform violations (all users)</LegalSubheading>
                <PolicyTable
                    headers={['Violation', 'Penalty']}
                    rows={[
                        ['Spam or abuse', 'Warning or suspension'],
                        ['Multiple fake accounts', 'Account termination'],
                        ['Unauthorized commercial activity', 'Account suspension or removal'],
                        ['Platform manipulation', 'Immediate restriction or ban'],
                    ]}
                />
            </LegalSection>

            <LegalSection title="7. Financial policy enforcement">
                <p>Aligned with your pricing model:</p>
                <BulletList
                    items={[
                        'Listing Fees (Basic, Pro, Premium): Non-refundable after publication',
                        'Authorization Fees (Home Seekers): Non-transferable and non-refundable',
                        'Subscriptions (Service Providers): No refunds for unused periods; suspension does not extend subscription duration',
                    ]}
                />
                <p className="text-sm text-gray-600">
                    See also:{' '}
                    <Link href="/routes/pricing" className="text-[#0000FF] font-medium hover:underline">
                        Pricing model
                    </Link>
                    .
                </p>
            </LegalSection>

            <LegalSection title="8. Listing &amp; content moderation">
                <p>FindAfriq reserves the right to:</p>
                <BulletList
                    items={[
                        'Remove or edit any listing without notice',
                        'Reject listings that do not meet standards',
                        'Verify properties and user identities',
                        'Assign or revoke “Verified” badges',
                    ]}
                />
            </LegalSection>

            <LegalSection title="9. Reporting &amp; dispute handling">
                <p>Users are encouraged to report:</p>
                <BulletList items={['Fake listings', 'Fraudulent users', 'Misconduct or abuse']} />
                <p className="font-medium text-gray-900">Process:</p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Complaint submission</li>
                    <li>Investigation by FindAfriq</li>
                    <li>Decision &amp; enforcement</li>
                    <li>Notification to involved parties</li>
                </ol>
            </LegalSection>

            <LegalSection title="10. Appeals process">
                <p>Users may appeal penalties by:</p>
                <BulletList
                    items={[
                        'Submitting a formal request via email',
                        'Providing evidence to support their case',
                    ]}
                />
                <p>FindAfriq reserves the final decision.</p>
            </LegalSection>

            <LegalSection title="11. Account suspension &amp; termination">
                <p>FindAfriq may:</p>
                <BulletList
                    items={[
                        'Suspend accounts temporarily for investigation',
                        'Permanently terminate accounts for severe violations',
                        'Block access without prior notice in critical cases',
                    ]}
                />
            </LegalSection>

            <LegalSection title="12. Legal &amp; compliance">
                <BulletList
                    items={[
                        'Violations involving fraud may be reported to authorities',
                        'Users remain legally responsible for their actions outside the platform',
                        'FindAfriq is not liable for user-to-user transactions',
                    ]}
                />
            </LegalSection>

            <LegalSection title="13. Policy updates">
                <p>
                    FindAfriq reserves the right to update this policy at any time. Continued use of the platform implies
                    acceptance of the updated policy.
                </p>
            </LegalSection>

            <LegalSection title="14. Conclusion">
                <p>This policy ensures that FindAfriq remains a trusted, transparent, and secure platform for connecting:</p>
                <BulletList items={['Verified properties', 'Trusted agents', 'Reliable service providers']} />
            </LegalSection>

            <LegalContactCard />
        </LegalDocLayout>
    );
}
