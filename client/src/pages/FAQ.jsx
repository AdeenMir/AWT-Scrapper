import { useState } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';

const faqItems = [
  {
    question: 'How does the scraper work?',
    answer:
      'The scraper loads the page content, then extracts the specified fields using the CSS selectors you provide. It supports text, attribute, and HTML extraction so you can pull structured content like titles, prices, links, and more.',
  },
  {
    question: 'What should I enter for item selectors?',
    answer:
      'Use a single CSS selector that matches the container element for each item. Common values include selectors like .product-item, article, or li. The scraper will run that selector across the page to capture each matching element.',
  },
  {
    question: 'How do field selectors work?',
    answer:
      'For each field, enter a key name and a selector that matches the data point inside the item container. If you want the value from an attribute like href, choose the attr type and provide the attribute name.',
  },
  {
    question: 'Can I schedule scrapes automatically?',
    answer:
      'Yes. Use the Schedules page to pick one of the provided cron-based intervals, select a saved scraper, and the system will automatically run it on the chosen cadence.',
  },
];

export default function FAQ() {
  const { isDark } = useDarkMode();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Layout>
      <div className="animate-fade-in-up max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className={`text-4xl font-bold mb-4`} style={{ color: 'var(--color-accent)' }}>FAQ</h1>
          <p className={`text-lg leading-relaxed`} style={{ color: 'var(--color-text-secondary)' }}>
            Find answers to the most common questions about how the scraper works and how to get the best results.
          </p>
        </div>

        <section className="space-y-4">
          {faqItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={item.question}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left rounded-3xl border p-6 card-fancy transition-all duration-300 ${
                  isActive
                    ? 'shadow-xl scale-[1.004]'
                    : 'hover:shadow-lg hover:-translate-y-1'
                }`}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>{item.question}</span>
                  <span className={`text-xl font-bold transition-transform duration-300 ${isActive ? 'rotate-45' : ''}`}
                        style={{ color: 'var(--color-primary)' }}>
                    +
                  </span>
                </div>
                <div className={`mt-4 overflow-hidden transition-all duration-300 ${isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className={`leading-relaxed`} style={{ color: 'var(--color-text-secondary)' }}>
                    {item.answer.split(' ').map((word, idx) => (
                      <span key={idx} style={{
                        fontWeight: (word.includes('.product-item') || word.includes('article') || word.includes('li') || word.includes('href')) ? 'bold' : 'normal',
                        color: (word.includes('.product-item') || word.includes('article') || word.includes('li') || word.includes('href')) ? 'var(--color-accent)' : 'inherit',
                      }}>
                        {word}{idx < item.answer.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </Layout>
  );
}
