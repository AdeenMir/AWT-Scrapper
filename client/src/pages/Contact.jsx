import { Mail, Phone, MapPin, Clock, Globe } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';

export default function Contact() {
  const { isDark } = useDarkMode();

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@webscrapper.pk',
      link: 'mailto:support@webscrapper.pk',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+92 (300) 555-0142',
      link: 'tel:+923005550142',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Block 6, PECHS, Karachi 75400, Pakistan',
      link: null,
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Monday - Friday, 10AM - 6PM PKT',
      link: null,
    },
  ];

  const bgClasses = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textClasses = isDark ? 'text-slate-300' : 'text-slate-600';

  return (
    <Layout>
      <div className="animate-fade-in-up max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            Contact WebScrapper Pakistan
          </h1>
          <p className={`text-lg leading-relaxed ${textClasses}`}>
            Have questions about our web scraping platform? Our team in Karachi is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {contactInfo.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`${bgClasses} border rounded-2xl p-6 card-fancy transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                      {item.label}
                    </p>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="font-semibold transition-colors"
                        style={{ color: isDark ? '#f0ede8' : '#3e3b37' }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-semibold" style={{ color: isDark ? '#f0ede8' : '#3e3b37' }}>
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className={`${bgClasses} border rounded-2xl p-8 card-fancy`}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            About WebScrapper Pakistan
          </h2>
          <div className={`space-y-4 ${textClasses}`}>
            <p>
              WebScrapper is Pakistan's leading web scraping and data extraction platform. Based in Karachi, we provide powerful tools for businesses and developers to collect, schedule, and analyze web data with ease. Since our launch in 2023, we've partnered with hundreds of Pakistani companies and startups.
            </p>
            <p>
              Our mission is to empower Pakistani businesses with accessible, reliable data collection technology. Whether you're scaling an e-commerce operation, monitoring market trends, or building a data-driven application, WebScrapper provides the tools you need to succeed.
            </p>
            <div className="pt-4 flex items-center gap-2">
              <Globe size={20} style={{ color: 'var(--color-primary)' }} />
              <span>
                Visit us online at{' '}
                <a
                  href="https://webscrapper.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-primary)' }}
                >
                  webscrapper.pk
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-8 text-center">
          <p className={textClasses}>
            Based in Karachi, Pakistan • Average response time: <span className="font-semibold">4-8 hours</span> during business hours (PKT)
          </p>
        </div>
      </div>
    </Layout>
  );
}
