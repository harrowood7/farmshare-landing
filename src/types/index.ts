export interface Logo {
  src: string;
  alt: string;
}

export interface HeroProps {
  title: string;
  description: string;
  backgroundImage: string;
  children?: React.ReactNode;
}

export interface VideoProps {
  videoUrl: string;
  className?: string;
}

export interface TestimonialProps {
  quote: string;
  author: string;
  company: string;
  image: string;
}