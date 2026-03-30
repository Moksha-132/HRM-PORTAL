import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const termsSections = [
  {
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using HRM Portal, you agree to follow these Terms & Conditions and any related policies referenced within the platform. These terms apply to all users, including administrators, managers, employees, and authorized support personnel.',
      'If you do not agree with these terms, you should not use the service. Continued use of the platform after updates or notices are published will be treated as acceptance of the revised terms.',
    ],
  },
  {
    title: 'Authorized Use of the Platform',
    content: [
      'HRM Portal is intended for legitimate organizational and employment-related activities such as workforce management, payroll operations, attendance workflows, internal communication, and document handling.',
      'Users must access the platform only through approved credentials and only for activities that are consistent with their assigned role, company policy, and applicable law.',
    ],
  },
  {
    title: 'Account Responsibility',
    content: [
      'Each user is responsible for maintaining the confidentiality of login credentials, preventing unauthorized access to their account, and promptly reporting suspicious activity, credential misuse, or lost access devices.',
      'Users are accountable for actions taken through their accounts unless they have promptly informed the appropriate administrator or support channel about unauthorized use.',
    ],
  },
  {
    title: 'Acceptable Conduct',
    content: [
      'Users must not attempt to disrupt the platform, bypass permissions, upload malicious files, scrape restricted data, impersonate others, or use the service for fraudulent, abusive, or unlawful purposes.',
      'All communications, uploads, and records created in the platform should remain professional, accurate, and relevant to organizational operations.',
    ],
  },
  {
    title: 'Employee Records and Submitted Content',
    content: [
      'Users are responsible for ensuring that information they submit is accurate, current, and appropriate for the purpose intended. This includes attendance details, leave requests, uploaded documents, payroll-related data, and internal messages.',
      'The organization may review, retain, correct, or remove submitted records where necessary to maintain compliance, operational accuracy, or security standards.',
    ],
  },
  {
    title: 'Intellectual Property and System Materials',
    content: [
      'The platform design, workflows, code, branding, templates, reports, and system-generated content remain the property of the service owner or the relevant organization unless otherwise stated.',
      'Users may not copy, republish, reverse engineer, redistribute, or commercially exploit any part of the platform beyond the permissions required for normal internal use.',
    ],
  },
  {
    title: 'Service Availability and Changes',
    content: [
      'We aim to keep HRM Portal available, stable, and secure, but uninterrupted access cannot be guaranteed at all times. Maintenance, upgrades, external failures, or security events may occasionally affect availability.',
      'Features, interfaces, workflows, and integrations may be updated, suspended, or improved as the product evolves. Reasonable efforts should be made to communicate significant changes where appropriate.',
    ],
  },
  {
    title: 'Suspension and Termination',
    content: [
      'Accounts may be restricted, suspended, or terminated if a user violates these terms, misuses organizational data, compromises security, or acts in a way that threatens the integrity of the platform or other users.',
      'The organization or platform operator may also disable access when employment status changes, contractual access ends, or administrative review requires temporary restriction.',
    ],
  },
  {
    title: 'Limitation of Liability and Governing Expectations',
    content: [
      'HRM Portal is provided for operational use with reasonable care, but users and organizations remain responsible for reviewing critical records, approvals, and payroll information before relying on them for final business decisions.',
      'To the extent permitted by law, the platform operator will not be liable for indirect losses, workflow delays, or business interruption arising from misuse, unauthorized access, third-party service failures, or events beyond reasonable control.',
    ],
  },
];

const TermsAndConditionsPage = () => {
  const [accepted, setAccepted] = useState(() => localStorage.getItem('termsAccepted') === 'true');

  useEffect(() => {
    localStorage.setItem('termsAccepted', accepted ? 'true' : 'false');
  }, [accepted]);

  return (
    <MainLayout>
      <section className="policy-page section">
        <div className="container">
          <div className="policy-shell animate-fade-up">
            <div className="policy-hero">
              <span className="policy-kicker">Use of Service</span>
              <h1 className="policy-title">Terms & Conditions</h1>
              <p className="policy-lead">
                These terms define how HRM Portal should be used, what responsibilities apply to each
                user account, and the standards required to keep the platform secure and reliable.
              </p>
              <div className="policy-meta">
                <span>Applies to platform access, records, uploads, and internal workflows</span>
                <span>Designed for safe, professional, and authorized organizational use</span>
              </div>
            </div>

            <div className="policy-grid">
              {termsSections.map((section, index) => (
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
              <h3>Key Expectations</h3>
              <ul>
                <li>Use the platform only for approved HR and business operations.</li>
                <li>Protect your login credentials and report suspicious access immediately.</li>
                <li>Do not misuse data, upload harmful material, or attempt unauthorized actions.</li>
                <li>The platform and organization may suspend accounts when security or policy violations occur.</li>
              </ul>
            </div>

            <div className="policy-actions">
              <label className="policy-checkbox">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>I have read and accept the Terms & Conditions</span>
              </label>
              <Link to="/login" className="btn btn-outline">Back to Login</Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default TermsAndConditionsPage;
