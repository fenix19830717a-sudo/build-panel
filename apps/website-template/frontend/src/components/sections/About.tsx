import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const highlights = [
  'Industry-leading expertise',
  'Award-winning solutions',
  'Global client base',
  'Continuous innovation',
  'Customer-centric approach',
  'Proven track record',
];

export default function About() {
  const { siteConfig } = useTheme();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Our Team"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <motion.div
              className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-background p-6 rounded-2xl shadow-xl border border-border"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-primary mb-1">10+</div>
              <div className="text-sm text-muted-foreground">Years of Excellence</div>
            </motion.div>

            {/* Decorative */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              About Us
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6">
              We Create Digital
              <span className="text-primary"> Experiences</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              {siteConfig.description} We are passionate about helping businesses 
              grow through innovative digital solutions. Our team of experts brings 
              together creativity and technology to deliver exceptional results.
            </p>
            
            <p className="text-muted-foreground mb-8">
              With over a decade of experience, we've helped hundreds of companies 
              transform their digital presence and achieve their business objectives. 
              Our commitment to excellence drives everything we do.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More About Us
              <ArrowRight size={18} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
