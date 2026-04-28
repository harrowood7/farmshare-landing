import { useMemo } from 'react';

interface OdometerProps {
  value: number;
  format?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  locale?: string;
}

const DIGIT_HEIGHT_EM = 1;

function Digit({ digit }: { digit: number }) {
  return (
    <span
      className="inline-block overflow-hidden align-baseline tabular-nums"
      style={{ height: `${DIGIT_HEIGHT_EM}em`, lineHeight: `${DIGIT_HEIGHT_EM}em` }}
    >
      <span
        className="block"
        style={{
          transform: `translateY(-${digit * DIGIT_HEIGHT_EM}em)`,
          transition: 'transform 600ms cubic-bezier(0.34, 1.4, 0.64, 1)',
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block" style={{ height: `${DIGIT_HEIGHT_EM}em`, lineHeight: `${DIGIT_HEIGHT_EM}em` }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Odometer({ value, format, prefix = '', suffix = '', locale = 'en-US' }: OdometerProps) {
  const formatted = useMemo(() => {
    return prefix + new Intl.NumberFormat(locale, format).format(value) + suffix;
  }, [value, format, prefix, suffix, locale]);

  return (
    <span className="inline-flex items-baseline">
      {Array.from(formatted).map((char, i) =>
        /\d/.test(char) ? (
          <Digit key={i} digit={parseInt(char, 10)} />
        ) : (
          <span key={i} className="inline-block whitespace-pre">
            {char}
          </span>
        )
      )}
    </span>
  );
}
