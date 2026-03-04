import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Target, Globe } from 'lucide-react';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import type { TimelineEvent, TeamMember } from '../types';

const timeline: TimelineEvent[] = [
  { year: '2014', title: 'Company Founded', description: 'Started with a vision to transform digital experiences.' },
  { year: '2016', title: 'First Major Client', description: 'Partnered with Fortune 500 company for digital transformation.' },
  { year: '2018', title: 'Global Expansion', description: 'Opened offices in Europe and Asia-Pacific regions.' },
  { year: '2020', title: 'Innovation Award', description: 'Recognized as Industry Innovator of the Year.' },
  { year: '2024', title: '10 Years Strong', description: 'Celebrating a decade of excellence and growth.' },
];

const team: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    bio: 'Visionary leader with 15+ years of industry experience.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'CTO',
    bio: 'Tech innovator driving our product development.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    bio: 'Award-winning designer creating beautiful experiences.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'VP of Sales',
    bio: 'Building lasting relationships with our clients.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  },
];

const values = [
  { icon: Target, title: 'Excellence', description: 'We strive for excellence in everything we do.' },
  { icon: Users, title: 'Collaboration', description: 'Teamwork makes the dream work.' },
  { icon: Globe, title: 'Innovation', description: 'Pushing boundaries to create the future.' },
  { icon: Award, title: 'Integrity', description: 'Honest and transparent in all our dealings.' },
];

export default function AboutPage() {
  const { siteConfig } = useTheme();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Layout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-6">
              Our Story
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {siteConfig.description} We are passionate about helping businesses 
              grow through innovative digital solutions.
            </p>
          </motion.div>

          {/* Values */}
          <section ref={ref} className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-muted/50 rounded-2xl text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden md:block"></div>
              
              {timeline.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center mb-8 md:mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <span className="text-3xl font-bold text-primary">{event.year}</span>
                    <h3 className="text-xl font-semibold text-foreground mt-1">{event.title}</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                  
                  <div className="hidden md:block w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-primary text-sm">{member.role}</p>
                  <p className="text-muted-foreground text-sm mt-1">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
