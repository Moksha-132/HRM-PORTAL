import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const privacySections = [
  {
    title: 'Information We Collect',
    content: [
      'HRM Portal collects the information required to create and manage employee, manager, and administrator accounts. This may include names, work email addresses, phone numbers, employee identifiers, department details, attendance records, payroll details, leave balances, uploaded documents, and communication history inside the platform.',
      'We may also collect technical information such as browser type, device details, IP address, login timestamps, and page interaction data to keep the platform secure, improve performance, and support troubleshooting when issues occur.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'The information collected through HRM Portal is used to deliver core HR functions such as authentication, profile management, attendance tracking, leave management, payroll processing, letters, notifications, support workflows, and role-based access across the system.',
      'We may also use limited operational data to improve user experience, monitor platform reliability, prevent misuse, maintain audit trails, and communicate important updates related to services, security, or policy changes.',
    ],
  },
  {
    title: 'Legal Basis and Internal Access',
    content: [
      'Personal information is processed only for legitimate business purposes connected to employment administration, organizational reporting, compliance needs, and secure operation of the platform.',
      'Access to personal data is restricted according to user role and business need. Administrators, HR teams, managers, and employees can only access the data that is relevant to their approved responsibilities within the organization.',
    ],
  },
  {
    title: 'Cookies, Sessions, and Analytics',
    content: [
      'We may use browser storage, cookies, and session technologies to keep users signed in, remember preferences, maintain application state, and support secure navigation across protected pages.',
      'These technologies may also help us understand feature usage patterns, error conditions, and performance issues so we can improve the stability and usability of the platform over time.',
    ],
  },
  {
    title: 'Data Sharing and Third Parties',
    content: [
      'HRM Portal does not sell personal information. Data may be shared only with authorized service providers, infrastructure partners, or internal business units that support hosting, security, email delivery, analytics, maintenance, or legal compliance.',
      'Whenever third-party services are involved, they are expected to handle data responsibly, use it only for approved purposes, and apply suitable safeguards to protect confidentiality and system integrity.',
    ],
  },
  {
    title: 'Data Retention',
    content: [
      'We retain personal and operational records for as long as they are reasonably required for employment administration, audit history, legal obligations, dispute resolution, and service continuity.',
      'When information is no longer needed, we aim to remove, anonymize, or securely archive it according to internal retention schedules and applicable legal or contractual requirements.',
    ],
  },
  {
    title: 'Security Measures',
    content: [
      'We use administrative, technical, and organizational safeguards designed to protect information from unauthorized access, misuse, disclosure, alteration, or destruction. These measures may include authentication controls, limited access permissions, encrypted communication channels, monitoring, and secure development practices.',
      'No digital system can guarantee absolute security, but we continuously work to reduce risk and respond promptly to suspicious activity, vulnerabilities, and service incidents.',
    ],
  },
  {
    title: 'Your Choices and Rights',
    content: [
      'Depending on your role and local legal requirements, you may have rights to request access to your information, seek correction of inaccurate details, update account information, or ask questions about how your data is being processed.',
      'If you believe any stored information is outdated, incomplete, or incorrect, you should contact your organization administrator or the platform support contact so appropriate review and correction can be made.',
    ],
  },
  {
    title: 'International Use and Policy Updates',
    content: [
      'If the platform is accessed from multiple regions, information may be processed where the service infrastructure or support teams operate. Reasonable steps should be taken to maintain consistent protection for that data across environments.',
      'This Privacy Policy may be updated periodically to reflect legal, operational, or product changes. Continued use of the platform after updates means the revised policy will apply from the effective date shown on this page.',
    ],
  },
];

const PrivacyPolicyPage = () => {
  const [accepted, setAccepted] = useState(() => localStorage.getItem('privacyAccepted') === 'true');

  useEffect(() => {
    localStorage.setItem('privacyAccepted', accepted ? 'true' : 'false');
  }, [accepted]);

  return (
    <MainLayout>
      <section className="policy-page section">
        <div className="container">
          <div className="policy-shell animate-fade-up">
            <div className="policy-hero">
              <span className="policy-kicker">Trust & Transparency</span>
              <h1 className="policy-title">Privacy Policy</h1>
              <p className="policy-lead">
                This policy explains how HRM Portal collects, uses, protects, and manages information
                connected to employee operations, communication workflows, and platform security.
              </p>
              <div className="policy-meta">
                <span>Effective for platform usage and account activity</span>
                <span>Applies to admins, managers, employees, and support interactions</span>
              </div>
            </div>

            <div className="policy-grid">
              {privacySections.map((section, index) => (
                <article key={section.title} className="policy-card">
                  <div className="policy-section-number">{String(index + 1).padStart(2, '0')}</div>
                  <h2>{section.title}</h2>
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>

            <div className="policy-summary">
              <h3>Quick Summary</h3>
              <ul>
                <li>We collect only the information required to operate HR workflows and secure the platform.</li>
                <li>Access to personal data is controlled through role-based permissions and business need.</li>
                <li>Information is not sold and is shared only when necessary for approved service or compliance purposes.</li>
                <li>You can raise correction or privacy concerns through your organization or platform support contact.</li>
              </ul>
            </div>

            <div className="policy-actions">
              <label className="policy-checkbox">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>I have read and accept the Privacy Policy</span>
              </label>
              <Link to="/login" className="btn btn-outline">Back to Login</Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
