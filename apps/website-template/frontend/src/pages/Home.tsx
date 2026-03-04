import Layout from '../components/Layout';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import Products from '../components/sections/Products';
import About from '../components/sections/About';
import News from '../components/sections/News';
import CTA from '../components/sections/CTA';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Features />
      <Products />
      <About />
      <News />
      <CTA />
    </Layout>
  );
}
