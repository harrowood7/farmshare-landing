import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionSection({ title, children, isOpen, onToggle }: AccordionSectionProps) {
  return (
    <div className="border border-stone-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between"
      >
        <h3 className="text-lg font-bold text-brand-green">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-brand-orange" />
        ) : (
          <ChevronDown className="h-5 w-5 text-brand-orange" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white">
          <div className="prose prose-stone max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServiceAgreement() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-roca text-brand-green mb-8">Farmshare Service Agreement</h1>
          
          <div className="prose prose-lg text-stone-700 mb-12">
            <p className="text-xl mb-6">
              <strong>Effective Date:</strong> The Effective Date is the date Customer accepts an Order Form, quote, or online checkout referencing this Agreement.
            </p>
            
            <p className="text-xl mb-6">
              This Farmshare Service Agreement (the "Service Agreement") governs Customer's access to and use of the Farmshare Processor Platform and related services. By accepting an Order Form, quote, or online checkout that references this Service Agreement, Customer agrees to be bound by it.
            </p>

            <p className="text-lg mb-6">
              This Farmshare Service Agreement ("Service Agreement") is made and entered into as of the effective date set forth above (the "Effective Date"), by and between Farmshare, Co., a Delaware corporation ("Farmshare"), with its principal place of business at 4777 National Western Drive, Denver, CO 80216, and the undersigned customer ("Customer"), with its principal place of business at the address set forth on the signature page hereto. Farmshare and Customer are collectively referred to each as a "Party" and collectively as the "Parties." The term "Agreement" as used in this document includes this Agreement, each order form executed by the Parties (each an "Order Form"), and any other exhibits, schedules, or addendums attached to this document or the applicable Order Form (an "Exhibit"). This Agreement constitutes a binding, valid, and enforceable agreement between the Parties as of the Effective Date. In the event of a conflict between the Service Agreement, any Order Form, and any Exhibits, the following order of precedence shall apply: the Order Form, the Agreement, the Exhibits.
            </p>

            <p className="text-lg mb-6">
              <strong>WHEREAS,</strong> Customer desires that Farmshare perform Services, as defined below, for the Customer and Farmshare desires to perform such Services for the Customer, subject to the terms and conditions set forth below.
            </p>

            <p className="text-lg mb-6">
              <strong>NOW, THEREFORE,</strong> in consideration of these premises and the mutual promises contained herein, and other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties do hereby agree as follows:
            </p>
          </div>

          <div className="space-y-4">
            <AccordionSection
              title="1. CERTAIN DEFINITIONS"
              isOpen={openSections['definitions']}
              onToggle={() => toggleSection('definitions')}
            >
              <p className="mb-4">
                <strong>1.1 "Privacy Policy"</strong> means the Farmshare Privacy Policy accessible at https://farmshare.co/privacy-policy/ (or such other URL provided by Farmshare from time to time) as may be updated by Farmshare from time to time.
              </p>
              <p className="mb-4">
                <strong>1.2 "Processor Platform"</strong> refers to the subscription based customer relationship management and enterprise resource planning software service provided by Farmshare, which includes tools for ecommerce, logistics, marketing automation, and order management tailored for independent agribusinesses.
              </p>
              <p className="mb-4">
                <strong>1.3 "Services"</strong> refers to the Customer's use of the Processor Platform and any related services provided by Farmshare to the Customer under this Agreement and each applicable Order Form.
              </p>
              <p className="mb-4">
                <strong>1.4 "Vendor User"</strong> means a business or individual that schedules or purchases products or services from Customer through the Services, that Customer markets to, communicate with, or target through the Services, or that otherwise interacts with Customer through the Services, or that Customer authorizes to use the Services in connection with Customer's business.
              </p>
              <p>
                <strong>1.5 "Vendor Data"</strong> means all data, information or other material about a Vendor User that Customer, an affiliate or Vendor User provides or submits to the Services. Vendor Data may include Cardholder Data and such portions of Customer Data that relate to specific Vendor Users. "Cardholder Data" means credit card numbers, expiration dates, billing addresses, and cardholder names as entered by Vendor Users and Customer. Cardholder Data is a subset of Vendor Data.
              </p>
            </AccordionSection>

            <AccordionSection
              title="2. SERVICES"
              isOpen={openSections['services']}
              onToggle={() => toggleSection('services')}
            >
              <p className="mb-4">
                <strong>2.1. Services.</strong> During the Term (as defined below), and subject to the terms of this Agreement, Farmshare agrees to provide the Services to the Customer as described in each Order Form, including a limited, non-transferable, non-exclusive, revocable, and non-sublicensable right to use the Processor Platform. The Parties may enter into additional Order Forms for the purchase of additional Services, each of which, shall be incorporated under this Agreement and subject to the terms and conditions hereof. The initial Order Form is attached hereto as Exhibit A.
              </p>
              <p className="mb-4">
                <strong>2.2 Changes to Platform.</strong> Farmshare may, in its sole discretion, make any changes to any Services that it deems necessary or useful to (i) maintain or enhance (a) the quality or delivery of Farmshare's products or services to its customers, including without limitation the Processor Platform, (b) the competitive strength of, or market for, Farmshare's products or services, including without limitation the Processor Platform, (c) the Processor Platform's cost efficiency or performance, or (ii) to comply with applicable law, governmental orders, ordinances, rules, regulations, statutes ("Laws").
              </p>
              <p className="mb-4">
                <strong>2.3 Customer Support and Scheduled Maintenance.</strong> Farmshare may be contacted by email at [support@farmshare.co] during normal operating hours (between 8:00 a.m. to 5:00 p.m. U.S. Mountain Time) on business days to consult with Farmshare personnel concerning problem resolution, bug reporting, documentation clarification, and general technical guidance. Farmshare will host and manage the Services, subject to downtime for maintenance reasonably limited to those hours of operation least impacted by customer usage, when such options are reasonably available. Farmshare will perform emergency maintenance on an as needed as determined in Farmshare's sole discretion.
              </p>
              <p className="mb-4">
                <strong>2.4 Aggregated and Anonymized Data.</strong> Notwithstanding anything to the contrary, Farmshare shall have the right to collect and analyze data and other information relating to the Services, including without limitation, information concerning Customer Data (as defined below) and data derived therefrom ("Aggregated Data"), and Farmshare will be free (during and after the Term hereof) to (i) use such information and data to improve and enhance the Services and for other development, marketing, diagnostic, and corrective purposes in connection with the Services and other Farmshare products and services; and (ii) disclose such data in aggregate or other de-identified form in connection with its business.
              </p>
              <p>
                <strong>2.5 Ownership.</strong> No provision of this Agreement shall be construed as an assignment or transfer of ownership of any copyrights, patents, trade secrets, trademarks, or any other intellectual property rights from Farmshare to Customer or Authorized Users. Farmshare shall own and retain all right, title and interest in and to: (i) the Services, Software (as defined below), Processor Platform, and all improvements, enhancements or modifications thereto; and (ii) Farmshare's Confirmation Information (as defined below), Aggregated Data; and (iii) all intellectual property rights related to any of the foregoing. As between Customer and Farmshare, Customer owns all right, title, and interest in Customer's Data. Customer hereby grants to Farmshare a nonexclusive, worldwide, assignable, sublicensable, fully paid-up, and royalty free license and right to copy, distribute, display and perform, publish, prepare derivative works of and otherwise use the Customer Data for the purposes of providing, improving, and developing Farmshare's or its affiliates' products and services and/or complementary products and services of its partners. Notwithstanding the above, all right, title, and interest in any data or information collected by Farmshare independently and without access to, reference to, or use of Customer Data, including without limitation, any data or information Farmshare obtains about Vendor Users through the Services (whether the same as Customer Data or otherwise), will be solely owned by Farmshare.
              </p>
            </AccordionSection>

            <AccordionSection
              title="3. PLATFORM ACCESS AND AUTHORIZED USERS"
              isOpen={openSections['platform-access']}
              onToggle={() => toggleSection('platform-access')}
            >
              <p className="mb-4">
                <strong>3.1 Administrative Users.</strong> During the configuration and set-up process for the Processor Platform, Customer will identify an administrative user name and password for Customer's enterprise Farmshare account. Farmshare reserves the right to refuse registration of, or cancel usernames and passwords it deems inappropriate.
              </p>
              <p className="mb-4">
                <strong>3.2 Authorized Users.</strong> Customer may allow a number of Customer's staff, employees, consultants, advisors, independent contractors, and Vendor Users to use the Processor Platform as "Authorized Users" for the sole purpose of performing their job functions for Customer or with respect to Vendor Users as otherwise permitted herein. Authorized User credentials and subscriptions are for designated Authorized Users and cannot be shared or used by more than one Authorized User, but may be reassigned to new Authorized Users replacing former Authorized Users who no longer require ongoing use of the Processor Platform.
              </p>
              <p className="mb-4">
                <strong>3.3 Authorized User Conditions to Use.</strong> As a condition to access and use of the Processor Platform, (i) each Authorized User shall agree to abide by the terms of Farmshare's end-user terms of use which it may adopt from time to time, (ii) Customer Users shall agree to abide by the terms of this Agreement, or a subset hereof, and (iii) Vendor Users shall agree to abide by the terms of the then-current Farmshare Vendor Terms of Service applicable to the Processor Platform, and, in each case, Customer shall ensure such compliance. Customer shall immediately notify Farmshare of any violation of the terms of any of the foregoing by any Authorized User upon becoming aware of such violation, and shall be liable for any breach of any of the foregoing agreements by any Authorized User.
              </p>
              <p className="mb-4">
                <strong>3.4 Account Responsibility.</strong> Customer will be responsible for (i) all uses of any account that Customer has access to, whether or not Customer has authorized the particular use or user, and regardless of Customer's knowledge of such use, including without limitation any associated fees that Customer may incur via the Services; and (ii) securing its Farmshare account, passwords (including but not limited to administrative and user passwords) and files. Farmshare is not responsible for any losses, damages, costs, expenses or claims that result from stolen or lost passwords or any unauthorized use of the Services. Customer is responsible for all activity occurring or relating to Customer's account, including but not limited to, the Authorized Users. Customer will ensure that its Authorized Users comply with relevant provisions of this Agreement and acceptable use policies provided or made available by Farmshare, and any applicable local, state, national, and foreign laws, including those related to data privacy and transmission of personal data, at all times while using the Services. Any reference in this Agreement to Customer's "access" or "use" of the Services (or similar phrase) is deemed to include access or use, as appropriate, by Authorized Users, and any act or omission of an Authorized User that does not comply with this Agreement will be deemed a breach of this Agreement by Customer. Customer is also responsible for ensuring that it has the appropriate rights to interact and/or contact Vendor Users through the Services, as applicable, in accordance with applicable laws and regulations.
              </p>
              <p>
                <strong>3.5 Privacy Policy.</strong> Farmshare's Privacy Policy governs how it collects and uses personal information that is submitted through the Services. By accessing or using the Services, Customer agrees that it has read and accepts the Privacy Policy. Without limitation, Customer acknowledges and agrees that Farmshare may process Customer Data for the purpose of providing the Services and related functions, such as billing and customer or Vendor User support, as well as to send direct marketing communications to Customer's representatives' or Vendor Users, data science and product or service improvement and reporting. Customer represents and warrants that it is authorized to process Customer Data and make such data available to Farmshare for uses as set out in this Agreement and Privacy Policy, including through appropriate notice, consent and by Customer's referring individuals, such as Vendor Users, to Farmshare's Privacy Policy (notwithstanding Farmshare's ability and right, to which Customer agrees, to request consent, and provide notice and its Privacy Policy separately to individuals).
              </p>
            </AccordionSection>

            <AccordionSection
              title="4. ADDITIONAL RESTRICTIONS AND RESPONSIBILITIES"
              isOpen={openSections['restrictions']}
              onToggle={() => toggleSection('restrictions')}
            >
              <p className="mb-4">
                <strong>4.1 Software Restrictions.</strong> Customer will not, nor permit or encourage any Authorized User, Vendor User, or third party to, directly or indirectly (i) reverse engineer, decompile, disassemble or otherwise attempt to discover or derive the source code, object code or underlying structure, ideas, know-how or algorithms relevant to the Processor Platform or any software, documentation or data related to the Processor Platform ("Software"); (ii) modify, disclose, alter, translate, or create derivative works based on the Processor Platform, Software, or any component of the Services; (iii) modify, remove or obstruct any proprietary notices or labels; (iv) use any Software or the Processor Platform in any manner to assist or take part in the development, marketing or sale of a product potentially competitive with such Software or Processor Platform; (v) use the Processor Platform to store or transmit any viruses, software routines, or other code designed to permit unauthorized access, disable, erase, or otherwise harm software, hardware, or data, or perform any other harmful actions; (vi) interfere with or disrupt the integrity or performance of the Services; or (vii) use the Software or allow the transfer, transmission, export or re-export of such Software or any portion thereof in violation of any Laws. For the avoidance of doubt, Software and the Services, including all user-visible aspects of the Services, are the Confidential Information of Farmshare, and Customer will comply with Section 5 with respect thereto.
              </p>
              <p className="mb-4">
                <strong>4.2 Customer Compliance.</strong> Customer shall use, and will ensure that all Authorized Users use, the Processor Platform, Software, and the Services in full compliance with this Agreement, Farmshare's end-user terms of use and all applicable laws and regulations. Customer represents and warrants that it (i) has accessed and reviewed any terms of use or other policies relating to the Processor Platform provided by Farmshare, (ii) understands the requirements thereof, and (iii) agrees to comply therewith. Farmshare may suspend Customer's account and access to the Processor Platform and performance of the Services at any time and without notice if Farmshare believes that Customer is in violation of this Agreement. Although Farmshare has no obligation to monitor Customer's use of the Processor Platform, Farmshare may do so and may prohibit any use it believes may be (or alleged to be) in violation of the foregoing.
              </p>
              <p className="mb-4">
                <strong>4.3 Customer Systems and Data.</strong> Customer shall be responsible for (i) obtaining and maintaining—both the functionality and security of—any equipment and ancillary services needed to connect to, access or otherwise use the Processor Platform, including modems, hardware, servers, software, operating systems, networking, web servers and the like; (ii) the accuracy and quality of Customer Data and for ensuring that Customer's collection and use of Customer Data complies with applicable laws, including those related to data privacy and transmission of personal data; (iii) preventing unauthorized access to, or use of, the Services, and notifying Farmshare promptly of any unauthorized access or use; and (iv) ensuring Customer has obtained the requisite level of consent necessary from Vendor Users when utilizing the Services, including but not limited to, any automated marketing protocols. Customer is solely responsible for resolving disputes regarding ownership or access to Customer Data, including those involving any current or former owners, co-owners, employees, affiliates, or contractors of the Customer's business.
              </p>
              <p className="mb-4">
                <strong>4.6 Restrictions on Export.</strong> Customer may not remove or export from the United States or allow the export or reexport of the Software or anything related to the Processor Platform, Software or Services, or any direct product thereof in violation of any restrictions, laws or regulations of any United States or foreign agency or authority.
              </p>
              <p>
                <strong>4.7 No Subsequent Registration.</strong> If Customer's registration(s) with or ability to access the Service is discontinued by Farmshare due to Customer's violation of any portion of the Agreement, then Customer agrees that it shall not attempt to re-register with or access the Service through use of a different member name or otherwise, and Customer acknowledges that it will not be entitled to receive a refund for fees related to those Services to which Customer's access has been terminated. In the event that Customer violates the immediately preceding sentence, Farmshare reserves the right, in its sole discretion, to immediately take any or all of the actions set forth herein without any notice or warning to Customer.
              </p>
            </AccordionSection>

            <AccordionSection
              title="5. CONFIDENTIALITY"
              isOpen={openSections['confidentiality']}
              onToggle={() => toggleSection('confidentiality')}
            >
              <p className="mb-4">
                <strong>5.1 Confidential Information.</strong> Each Party (the "Disclosing Party") may disclose information to the other Party (the "Receiving Party") or otherwise learn such information, that is designated confidential or that reasonably should be understood to be confidential whether disclosed in an oral, written or any other format, including without limitation business, technical or financial information relating to the Disclosing Party's business (hereinafter referred to as "Confidential Information"). Confidential Information of Farmshare includes non-public information regarding features, functionality and performance of the Services, including information related to the Processor Platform and Software. Confidential Information of Customer includes non-public data provided by Customer to Farmshare to enable the provision of access to, and use of, the Services as well as all content, data and information recorded and stored in the Processor Platform for Customer ("Customer Data"), which may include Vendor Data and Cardholder Data (and Customer and their respresentative's data) but excludes Aggregated Data. The terms and conditions of this Agreement, including all pricing and related metrics, are Farmshare's Confidential Information.
              </p>
              <p className="mb-4">
                <strong>5.2 Exceptions; Required Disclosure.</strong> Notwithstanding anything to the contrary contained herein, Confidential Information shall not include any information that the Receiving Party can document (i) is or becomes generally available to the public, (ii) was in its possession or known by it prior to receipt from the Disclosing Party, (iii) was rightfully disclosed to it without restriction by a third party, or (iv) was independently developed without use of or reference to any Confidential Information of the Disclosing Party. In the event that a Party is required by a binding order of a governmental agency or court of competent jurisdiction to disclose any Confidential Information of the other Party, it shall, to the extent practicable and if lawfully permitted, provide the other Party with prompt written notice sufficient to allow that Party an opportunity to appear and object to such disclosure. If such objection is unsuccessful, then the Party shall produce only such Confidential Information as is required by the court order or governmental action.
              </p>
              <p className="mb-4">
                <strong>5.3 Non-use and Non-disclosure.</strong> With respect to Confidential Information of the Disclosing Party, the Receiving Party agrees to: (i) use the same degree of care to protect the confidentiality, and prevent the unauthorized use or disclosure, of such Confidential Information it uses to protect its own proprietary and confidential information of like nature, which shall not be less than a reasonable degree of care, (ii) hold all such Confidential Information in strict confidence and not use, sell, copy, transfer reproduce, or divulge such Confidential Information to any third party, and (iii) not use such Confidential Information for any purposes whatsoever other than the performance of, or as otherwise authorized by, this Agreement.
              </p>
              <p className="mb-4">
                <strong>5.4 Remedies for Breach of Obligation of Confidentiality.</strong> The Receiving Party acknowledges that breach of its obligation of confidentiality may cause irreparable harm to the Disclosing Party for which the Disclosing Party may not be fully or adequately compensated by recovery of monetary damages. Accordingly, in the event of any violation, or threatened violation, by the Receiving Party of its obligations under this Section 5, the Disclosing Party shall be entitled to seek injunctive relief from a court of competent jurisdiction in addition to any other remedy that may be available at law or in equity, without the necessity of posting bond or proving actual damages.
              </p>
              <p className="mb-4">
                <strong>5.5 Feedback.</strong> Any suggestions, comments or other feedback provided by Customer (including any Authorized User) to Farmshare with respect to Farmshare or the Services (collectively, "Feedback") will constitute Confidential Information of Farmshare, and Farmshare shall own all right, title, and interest in and to the Feedback.
              </p>
              <p>
                <strong>5.6 Return of Confidential Information.</strong> Upon expiration or termination of this Agreement, or such earlier time as the Disclosing Party requests, the Receiving Party shall return to the Disclosing Party or its designee, or at the Disclosing Party's request, securely destroy or render unreadable or undecipherable, each and every original and copy in every media of all Confidential Information in the Receiving Party's possession, custody, or control. The foregoing shall not apply to the extent information must be retained pursuant to applicable legal or regulatory requirements or for purposes of the Receiving Party's commercially reasonable disaster recovery procedures, provided such information shall continue to be subject to the confidentiality obligations of this Agreement, including without limitation this Section 5.
              </p>
            </AccordionSection>

            <AccordionSection
              title="6. FEES & PAYMENT"
              isOpen={openSections['fees-payment']}
              onToggle={() => toggleSection('fees-payment')}
            >
              <p className="mb-4">
                <strong>6.1 Fees.</strong> Customer will pay Farmshare the then-applicable fees described in an Order Form, in accordance with the terms set forth therein ("Fees"), including, for the avoidance of doubt, any fees incurred through Customer's use of the Processor Platform exceeding a services capacity parameter specified on an Order Form. All Fees shall be paid in U.S. dollars.
              </p>
              <p className="mb-4">
                <strong>6.2 Payment.</strong> Farmshare may choose to bill through an invoice, in which case, full payment for invoices issued in any given month must be received by Farmshare thirty (30) days after the delivery date of the invoice (unless otherwise specified on the applicable Order Form). Unpaid amounts are subject to a finance charge of 1.5% per month on any outstanding balance, or the maximum permitted by Law, whichever is lower, plus all expenses of collection, including reasonable attorneys fees. In addition to any other remedies available, Farmshare may suspend Services in the event of payment delinquency. Customer agrees to accurately record all usage based requirements, including for example, pounds of meat processed in any given month, in the Processor Platform to ensure accurate invoicing of Fees.
              </p>
              <p className="mb-4">
                <strong>6.3 Payment Disputes.</strong> If Customer believes that Farmshare has billed Customer incorrectly, Customer must contact Farmshare no later than ten (10) days after the delivery date on the applicable invoice in which the believed error or problem appeared in order to receive an adjustment or credit. Inquiries should be directed to Farmshare's finance department at finance@farmshare.co. Upon the expiration of such ten (10) day period, the applicable invoice shall be deemed automatically accepted and undisputed by the Customer. If the Parties are unable to resolve any disputed invoices within thirty (30) days following the Customer's dispute notice, such amounts shall be subject to Section 9 of this Agreement.
              </p>
              <p className="mb-4">
                <strong>6.4 Taxes.</strong> Customer will be responsible for and will pay all taxes and duties of any kind, including any value added tax and withholding tax, and all similar fees levied upon or associated with the provision of the Services excluding only taxes based solely on Farmshare's net income (the "Taxes"). Customer will pay all undisputed Fees to Farmshare free and clear of, and without reduction for, any withholding taxes. If any withholding taxes must be paid based on the Fees, then Customer will pay all such taxes and the Fees payable to Farmshare under this Agreement will be increased such that the amounts actually paid to Farmshare will be no less than the amounts that Farmshare would have received notwithstanding such Taxes. Upon request, Customer will provide Farmshare with written documentation, including but not limited to copies of receipts, of any and all such taxes paid in connection with this Agreement. Customer will indemnify and hold Farmshare harmless from and against any and all such Taxes and any costs associated with the collection or withholding thereof, including without limitation, penalties, and interest.
              </p>
              <p className="mb-4">
                <strong>6.5 Expenses.</strong> Except as otherwise approved by the other Party's prior written consent, neither Party will pay expenses of the other Party under the Agreement.
              </p>
              <p className="mb-4">
                <strong>6.6 No Deductions or Setoffs.</strong> All amounts payable to Farmshare hereunder shall be paid by Customer to Farmshare in full without any setoff, recoupment, counterclaim, deduction, debit or withholding for any reason except as may be required by Law.
              </p>
              <p>
                <strong>6.7 Payment Processor.</strong> Farmshare offers the ability to process payments through the Services ("Payment Processing Services"). Payment Processing Services are provided by Farmshare's third party payment processing partners and any procurement by Customer or its affiliates will be subject to a separate merchant agreement which will be solely between the Customer (or its affiliate) and the third party processor. If Customer uses the Payment Processing Services, Customer agrees that Customer and its affiliates will comply with the terms and conditions of any applicable merchant agreements and all applicable card network rules, policies, laws, and regulations, at all times while using such Payment Processing Services. Although the Services may allow Customer to access or use the Payment Processing Services, they are not "Services" under this Agreement and are not subject to any of the warranties, service commitments, or other obligations with respect to the Services herein. At Farmshare's discretion, Customer may be offered Payment Processing Services provided by Stripe ("Farmshare Payments"). Farmshare Payments are subject to the Stripe Connected Account Agreement, which includes the Stripe Terms of Service (collectively, the "Stripe Services Agreement") and subject to certain fees and surcharges communicated to Customer during the enrollment process and as may be updated by Farmshare from time to time. By enrolling in Farmshare Payments, Customer agrees to be bound by the Stripe Services Agreement, as the same may be modified by Stripe from time to time. As a condition of Farmshare enabling Payment Processing Services through Stripe, Customer agrees to provide Farmshare accurate and complete information about Customer and its business, and it authorizes Farmshare to share it and transaction information related to Customer's use of the Payment Processing Services provided by Stripe pursuant to Farmshare's Privacy Policy. To the extent permitted by law, Farmshare may collect any obligations Customer owes Farmshare under this Agreement by deducting the corresponding amounts from funds payable to Customer arising from the settlement of card transactions through Farmshare Payments. Fees will be assessed at the time a transaction is processed and will be first deducted from the funds received for such transactions. If the settlement amounts are not sufficient to meet Customer's obligations to Farmshare, Farmshare may charge or debit the bank account or credit card registered in Customer's account for any amounts owed to Farmshare. Farmshare may offer special pricing, credits, and/or discounts to Customer or Customer's affiliates for the Services contingent upon timely procurement, and continued material usage, of the Payment Processing Services and/or Farmshare Payments. In the event Customer or Customer's affiliates stop utilizing the Payment Processing Services and/or Farmshare Payments, Farmshare may, in its sole discretion, revoke the special pricing, credits, and/or discounts being applied to the Services. CUSTOMER\'S USE OF THE PAYMENT PROCESSING SERVICES IS AT ITS OWN RISK.
              </p>
            </AccordionSection>

            <AccordionSection
              title="7. TERM AND TERMINATION"
              isOpen={openSections['term-termination']}
              onToggle={() => toggleSection('term-termination')}
            >
              <p className="mb-4">
                <strong>7.1 Term.</strong> This Agreement shall remain in effect until its termination as provided below (the "Term"). The term of each Order Form shall begin on the applicable "Order Form Effective Date" and continue for the "Service Term," in each case as specified in such Order Form. Unless otherwise set forth therein, each Order Form shall renew for additional (i) one (1) year periods if the Service Term is equal to or greater than one (1) year, or (ii) periods equal to the Service Term if the Service Term is less than one (1) year (each, a "Renewal Term"), unless written notice of non-renewal is received by the other Party at least sixty (60) days, but not less than thirty (30) days, prior to the expiration of the then current Service Term.
              </p>
              <p className="mb-4">
                <strong>7.2 Termination.</strong> Farmshare may terminate this Agreement upon written notice to Customer if no Order Form is in effect and as otherwise set forth herein. In addition to any other remedies it may have, either Party may also terminate this Agreement, and/or any applicable Order Form, upon written notice if the other Party fails to pay any amount when due or otherwise materially breaches this Agreement and fails to cure such breach within thirty (30) days or as agreed upon by both Parties after receipt of written notice of such breach from the non-breaching Party.
              </p>
              <p>
                <strong>7.3 Effect of Termination.</strong> Upon termination of the Agreement, each outstanding Order Form, if any, shall terminate and Customer shall immediately cease all use of, and all access to, the Services and Farmshare shall immediately cease providing the Services. If (i) Farmshare terminates this Agreement pursuant to the second sentence of Section 7.2, or (ii) Customer terminates this Agreement pursuant to clause (i) of the last sentence of Section 7.2, all Fees that would have become payable had each outstanding Order Form remained in effect until expiration of its current Service Term will become immediately due and payable.
              </p>
            </AccordionSection>

            <AccordionSection
              title="8. WARRANTY; DISCLAIMER; LIMITATION OF LIABILITY; AND INDEMNIFICATION"
              isOpen={openSections['warranty-disclaimer']}
              onToggle={() => toggleSection('warranty-disclaimer')}
            >
              <p className="mb-4">
                <strong>8.1 Representations.</strong> Each Party represents and warrants that it has the legal power to enter into this Agreement. Additionally, Customer warrants that (i) Customer owns or has a license to use and has obtained all consents and approvals necessary for the provision and use of all of the Customer Data that is placed on, transmitted via or recorded in the Processor Platform and the Services; (ii) the provision and use of Customer Data as contemplated by this Agreement and the Processor Platform and the Services does not and shall not violate any Customer's privacy policy, terms of-use or other agreement to which Customer is a party or any Law to which Customer is subject to.
              </p>
              <p className="mb-4">
                <strong>8.2 Disclaimer.</strong> EXCEPT AS EXPRESSLY PROVIDED HEREIN OR IN AN ORDER FORM, FARMSHARE DOES NOT WARRANT THAT ACCESS TO THE PROCESSOR PLATFORM, SOFTWARE OR SERVICES WILL BE UNINTERRUPTED OR ERROR FREE, NOR DOES FARMSHARE MAKE ANY WARRANTY AS TO THE RESULTS THAT MAY BE OBTAINED FROM USE OF THE SERVICES. FURTHER, FARMSHARE MAKES NO REPRESENTATIONS OR WARRANTIES WITH RESPECT TO SERVICES PROVIDED BY THIRD PARTY TECHNOLOGY SERVICE PROVIDERS RELATING TO OR SUPPORTING THE SERVICES, INCLUDING HOSTING AND MAINTENANCE SERVICES, AND ANY CLAIM OF CUSTOMER ARISING FROM OR RELATING TO SUCH SERVICES SHALL, AS BETWEEN FARMSHARE AND SUCH THIRD-PARTY SERVICE PROVIDER, BE SOLELY AGAINST SUCH THIRD-PARTY SERVICE PROVIDER. THE PROCESSOR PLATFORM, SOFTWARE AND SERVICES ARE PROVIDED "AS IS," AND FARMSHARE EXPRESSLY DISCLAIMS ANY AND ALL REPRESENTATIONS AND WARRANTIES, EXPRESS OR IMPLIED, ORAL OR WRITTEN, WITH RESPECT TO THIS AGREEMENT AND THE SERVICES, WHETHER ALLEGED TO ARISE BY OPERATION OF LAW, BY REASON OF CUSTOM OR USAGE IN THE TRADE, OR BY COURSE OF DEALING, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS OR SUITABILITY FOR A PARTICULAR PURPOSE (WHETHER OR NOT FARMSHARE KNOWS, HAS REASON TO KNOW, HAS BEEN ADVISED, OR IS OTHERWISE AWARE OF ANY SUCH PURPOSE), TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.
              </p>
              <p className="mb-4">
                <strong>8.3 Limitation of Liability.</strong> FARMSHARE SHALL NOT BE LIABLE FOR ANY LOSS OF PROFITS, LOSS OF DATA, LOSS OF BUSINESS OR GOODWILL, INTERRUPTION OF BUSINESS, HOWEVER CAUSED, OR FOR INDIRECT, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES OF ANY KIND, EVEN IF FARMSHARE RECEIVED ADVANCE NOTICE OF THE POSSIBILITY OF SUCH DAMAGES, WHETHER OR NOT ANY OF THE MATTERS AFORESAID ARISES IN CONTRACT OR TORT (INCLUDING NEGLIGENCE) OR MISREPRESENTATION OR ANY OTHER LEGAL THEORY. FARMSHARE'S ENTIRE LIABILITY TO THE CUSTOMER UNDER THIS AGREEMENT, REGARDLESS OF WHETHER THE CLAIM FOR SUCH DAMAGES IS BASED IN CONTRACT OR TORT (INCLUDING NEGLIGENCE) OR MISREPRESENTATION OR BREACH OF STATUTORY DUTY OR ANY DUTY UNDER GENERAL LAW OR ANY OTHER LEGAL THEORY, SHALL NOT EXCEED THE LESSER OF (I) ONE TIMES THE AMOUNT OF FEES PAID TO FARMSHARE BY THE CUSTOMER DURING THE PREVIOUS SIX-MONTH PERIOD PRECEDING THE CLAIM; OR (II) $20,000 USD.
              </p>
              <p>
                <strong>8.4 Indemnification.</strong> Customer agrees to indemnify, defend, and hold harmless Farmshare and its affiliates, and their respective officers, directors, employees, shareholders, agents, licensors, and service providers from and against any and all third party claims alleged or asserted against them, and all related charges, damages, and expenses (including but not limited to, reasonable attorneys' fees and costs) arising from or relating to (i) actual or alleged breach by Customer or an Authorized User of any provision of this Agreement; (ii) any access to or use of the Services by Customer or any Authorized User; (iii) any actual or alleged violation by Customer or any Authorized User of the intellectual property, privacy or rights of a third party; and (iv) any dispute between Customer and a third party regarding ownership of or access to Customer Data.
              </p>
            </AccordionSection>

            <AccordionSection
              title="9. GOVERNING LAW AND DISPUTE RESOLUTION"
              isOpen={openSections['governing-law']}
              onToggle={() => toggleSection('governing-law')}
            >
              <p>
                This Agreement is governed in all respects by the laws of the State of Colorado, without giving effect to its rules relating to conflict of laws. Any dispute arising out of or relating to this Agreement, or its subject matter, shall be resolved in accordance with this Section 9. First, the Parties agree to attempt in good faith to resolve the dispute through good faith negotiations for a period of fifteen (15) calendar days. Second, if the dispute is not resolved through good faith negotiations, the Parties agree to participate in binding arbitration administered by the American Arbitration Association ("AAA") under the Commercial Arbitration Rules of the AAA. Either Party may send a notice to the other Party of its intention to file a case with the AAA under this Section 9 ("Arbitration Notice"). The arbitration will be conducted in Denver, Colorado by a single arbitrator knowledgeable in commercial contracting matters and the commercial aspects of "software as a service" arrangements. The Parties will mutually appoint an arbitrator within thirty (30) days of the Arbitration Notice. If the Parties are unable to agree on an arbitrator, then the AAA will appoint an arbitrator who meets the foregoing knowledge requirements. The arbitrator will provide detailed written explanations to the parties to support their award and regardless of outcome, each Party shall pay its own costs and expenses (including attorneys' fees) associated with the arbitration proceeding and fifty percent (50%) of the fees of the arbitrator and the AAA. The arbitration award will be final and binding and may be enforced in any court of competent jurisdiction located in Denver, Colorado. Either Party may bring a lawsuit solely for injunctive relief without first engaging in the dispute resolution process described in this Section 9. In the event that the dispute resolution procedures in this Section 9 are found not to apply to a given claim, or in the event of a claim for injunctive relief as specified in the previous sentence, the Parties agree that any judicial proceeding will be exclusively brought in the state or federal courts of Denver, Colorado.
              </p>
            </AccordionSection>

            <AccordionSection
              title="10. SECURITY"
              isOpen={openSections['security']}
              onToggle={() => toggleSection('security')}
            >
              <p>
                Farmshare may, from time to time, host and/or maintain the Processor Platform using a third party technology service. Farmshare and Customer acknowledges that Farmshare cannot offer any additional or modified procedures other than those put in place by such technology provider with respect to such technology service.
              </p>
            </AccordionSection>

            <AccordionSection
              title="11. PUBLICITY"
              isOpen={openSections['publicity']}
              onToggle={() => toggleSection('publicity')}
            >
              <p>
                Customer agrees that, during the Term and thereafter, Farmshare may identify Customer as a customer and use Customer's logo and trademark in Farmshare's promotional materials, including without limitation Farmshare's website and social media channels. Customer may request that Farmshare stop doing so by submitting an email to marketing@farmshare.co at any time. Customer acknowledges that it may take Farmshare up to 30 days to process such request. Notwithstanding anything herein to the contrary, Customer acknowledges that Farmshare may disclose the existence and terms and conditions of this Agreement to its advisors, actual and potential sources of financing or acquisition, and to third parties for purposes of due diligence.
              </p>
            </AccordionSection>

            <AccordionSection
              title="12. ASSIGNMENT"
              isOpen={openSections['assignment']}
              onToggle={() => toggleSection('assignment')}
            >
              <p>
                Neither Party may assign this Agreement to any third party without the prior written consent of the other Party; provided that no consent or notice is required in connection with an assignment by Farmshare to an affiliate or in connection with any merger, reorganization, consolidation, sale of assets or similar transaction.
              </p>
            </AccordionSection>

            <AccordionSection
              title="13. GENERAL PROVISIONS"
              isOpen={openSections['general-provisions']}
              onToggle={() => toggleSection('general-provisions')}
            >
              <p>
                If any provision of this Agreement is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that this Agreement will otherwise remain in full force and effect and enforceable. This Agreement, together with Order Forms entered into hereunder and all Attachments hereto and thereto is the complete and exclusive statement of the mutual understanding of the Parties and supersedes and cancels all previous written and oral agreements, communications and other understandings relating to the subject matter of this Agreement. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the Parties to this Agreement. No delay or failure to require performance or express waiver of any provision of this Agreement shall constitute a waiver of that provision in any other instance or of any other provision. Any notice required under this Agreement shall be in writing and deemed sufficient when delivered personally or by overnight courier, or sent by email to the Party to be notified at such Party's email address specified on the signature page, or forty eight (48) hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the Party to be notified at such Party's address specified on the signature page. The relationship between the Parties is that of independent contractors and neither Party shall have any right, power, or authority to create any obligation or responsibility on behalf of the other Party, solely as a result of this Agreement. Customer understands that Farmshare may engage subcontractors (each a "Subcontractor") to perform some of the Services. Farmshare shall be responsible for the performance of any such Subcontractors. Except for payment obligations hereunder, neither Party will be deemed to be in breach of this Agreement, or be entitled to damages or credits pursuant to this Agreement, for any failure or delay in performance caused by reasons beyond its control, which may include but are not limited to an act of God, war, civil disturbance, court order, labor dispute, epidemic or pandemic of known or unknown contagion or other public health emergencies, governmental action or inaction, terrorism or terrorist acts, fire, flood, hurricane or other windstorm, explosion, earthquake or serious accident, failures or fluctuations in power, heat, light, air conditioning or telecommunications equipment. Notice of a Party's failure or delay in performance due to force majeure must be given to the other Party within five (5) business days after its occurrence. In the event the force majeure event continues for a period of thirty (30) calendar days, the impacted Party shall have the right to terminate the applicable Order Form(s) with five (5) business days prior written notice to the other Party. The Agreement may be executed in counterparts, which, taken together, shall form one legal instrument. Delivery of an executed counterpart signature page of the Agreement by email or other electronic transmission shall be as effective as delivery of an executed counterpart by mail or in person.
              </p>
            </AccordionSection>
          </div>

       
        </div>
      </div>
    </div>
  );
}