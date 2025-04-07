import React from 'react';

export default function LegalPage() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms and Privacy Policy</h1>

      {/* Terms Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Terms of Service</h2>
        <div className="prose dark:prose-invert max-w-none space-y-4">
          <p>
            Welcome to BeatyOS! These terms and conditions outline the rules and regulations
            for the use of BeatyOS&apos;s Website, located at [Your Website URL]. By accessing
            this website we assume you accept these terms and conditions. Do not continue to
            use BeatyOS if you do not agree to take all of the terms and conditions stated
            on this page.
          </p>
          <h3 className="text-lg font-semibold mt-4">Cookies</h3>
          <p>
            We employ the use of cookies. By accessing BeatyOS, you agreed to use cookies in
            agreement with the BeatyOS&apos;s Privacy Policy (detailed below).
          </p>
          <h3 className="text-lg font-semibold mt-4">License</h3>
          <p>
            Unless otherwise stated, BeatyOS and/or its licensors own the intellectual property
            rights for all material on BeatyOS. All intellectual property rights are reserved.
            You may access this from BeatyOS for your own personal use subjected to restrictions
            set in these terms and conditions. You must not: Republish material from BeatyOS;
            Sell, rent or sub-license material from BeatyOS; Reproduce, duplicate or copy
            material from BeatyOS; Redistribute content from BeatyOS.
          </p>
          <h3 className="text-lg font-semibold mt-4">Disclaimer</h3>
          <p>
            To the maximum extent permitted by applicable law, we exclude all representations,
            warranties and conditions relating to our website and the use of this website...
            [... More placeholder terms ...]
          </p>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Privacy Policy</h2>
        <div className="prose dark:prose-invert max-w-none space-y-4">
           <p>
             Your privacy is important to us. It is BeatyOS&apos;s policy to respect your privacy
             regarding any information we may collect from you across our website,
             [Your Website URL], and other sites we own and operate.
           </p>
          <h3 className="text-lg font-semibold mt-4">Information We Collect</h3>
          <p>
            Log data: Like most website operators, we collect information that your browser sends
            whenever you visit our Website... [e.g., IP address, browser type, pages visited].
          </p>
           <p>
            Personal Information: We may ask you to provide us with certain personally identifiable
            information... [e.g., email address when you log in or contact us].
          </p>
          <h3 className="text-lg font-semibold mt-4">Use of Information</h3>
          <p>
            We use the information we collect in various ways, including to: Provide, operate,
            and maintain our website; Improve, personalize, and expand our website; Understand
            and analyze how you use our website; Develop new products, services, features, and
            functionality; Communicate with you; Send you emails; Find and prevent fraud.
          </p>
          <h3 className="text-lg font-semibold mt-4">Security</h3>
           <p>
             The security of your Personal Information is important to us, but remember that no
             method of transmission over the Internet, or method of electronic storage, is 100%
             secure...
           </p>
          <p className="mt-4">
            [... More placeholder policy details ...]
          </p>
        </div>
      </section>

       <p className="mt-6 text-sm text-muted-foreground">
         Last updated: {lastUpdated}
      </p>
    </div>
  );
}