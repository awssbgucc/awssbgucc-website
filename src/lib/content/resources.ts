import type { SbgTone } from '@/components/site/SbgIcon';

export type ResourceCategory = 'Getting started' | 'Exam prep' | 'Hands-on labs' | 'Reference' | 'Session materials';

export type PublicResourceItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  source: string;
  tone: SbgTone;
  eventHref?: string;
};

export function curatedResources(builderCenterUrl: string): PublicResourceItem[] {
  return [
    {
      id: 'aws-skill-builder',
      title: 'AWS Skill Builder',
      description: 'Official free digital courses and Cloud Practitioner practice exams used alongside our bootcamp.',
      url: 'https://skillbuilder.aws',
      category: 'Exam prep',
      source: 'AWS',
      tone: 'purple',
    },
    {
      id: 'clf-c02-guide',
      title: 'AWS Certified Cloud Practitioner (CLF-C02) Exam Guide',
      description: 'Official exam domains, weightings and sample questions for the Cloud Practitioner certification track.',
      url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
      category: 'Exam prep',
      source: 'AWS Certification',
      tone: 'purple',
    },
    {
      id: 'aws-builder-center',
      title: 'AWS Builder Center',
      description: 'Sign up with the group link for technical articles, community learning paths and builder discussions.',
      url: builderCenterUrl,
      category: 'Getting started',
      source: 'AWS Community',
      tone: 'mint',
    },
    {
      id: 'aws-free-tier',
      title: 'AWS Free Tier',
      description: 'Overview of always-free and 12-month free services so you can practise safely without surprise bills.',
      url: 'https://aws.amazon.com/free/',
      category: 'Getting started',
      source: 'AWS',
      tone: 'mint',
    },
    {
      id: 'aws-workshops',
      title: 'AWS Workshops',
      description: 'Self-paced hands-on workshops covering web hosting, serverless, containers, security and AI.',
      url: 'https://workshops.aws/',
      category: 'Hands-on labs',
      source: 'AWS',
      tone: 'magenta',
    },
    {
      id: 's3-static-hosting',
      title: 'Amazon S3 Static Website Hosting Guide',
      description: 'Step-by-step documentation matching our bootcamp and From Code to Cloud portfolio labs.',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html',
      category: 'Hands-on labs',
      source: 'AWS Docs',
      tone: 'magenta',
    },
    {
      id: 'aws-docs',
      title: 'AWS Documentation',
      description: 'Official service guides, CLI references and tutorials for Amazon S3, Amazon EC2, AWS Lambda and more.',
      url: 'https://docs.aws.amazon.com/',
      category: 'Reference',
      source: 'AWS Docs',
      tone: 'blue',
    },
    {
      id: 'well-architected',
      title: 'AWS Well-Architected Framework',
      description: 'Core cloud design principles covering security, reliability, performance and cost optimisation.',
      url: 'https://aws.amazon.com/architecture/well-architected/',
      category: 'Reference',
      source: 'AWS Architecture',
      tone: 'blue',
    },
  ];
}
