import { profile } from '../data/content';
import { ContactForm } from '../components/ContactForm';
import { MailIcon, MapPinIcon } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { Section } from '../components/Section';
import { SocialLinks } from '../components/SocialLinks';
import { ContactGlobe } from '../components/ContactGlobe';
import { Tilt } from '../components/Tilt';

export function Contact() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let’s talk"
      intro="I’m open to software developer roles in backend, data and full-stack work. Send a message and I’ll reply by email."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Reveal className="flex flex-col gap-2">
          <ContactGlobe />
          <Tilt className="card">
          <a
            href={`mailto:${profile.email}`}
            className="flex min-h-touch items-center gap-2 p-3"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
              <MailIcon />
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-muted">Email</span>
              <span className="block break-all font-semibold">{profile.email}</span>
            </span>
          </a>
          </Tilt>
          <Tilt className="card flex items-center gap-2 p-3">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
              <MapPinIcon />
            </span>
            <span>
              <span className="block text-sm text-muted">Location</span>
              <span className="block font-semibold">{profile.location}</span>
            </span>
          </Tilt>
          {(profile.github || profile.linkedin) && <SocialLinks />}
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
