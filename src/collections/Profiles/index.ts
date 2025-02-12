import type { CollectionConfig } from 'payload/types'
import { checkRole } from '../Users/checkRole';
import { slugField } from '../../fields/slug'
import { populateArchiveBlock } from '../../hooks/populateArchiveBlock'
import { formatAppURL, revalidatePage } from '../../hooks/revalidatePage'
import { admins } from '../../access/admins'

const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'firstname',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    preview: doc =>
      `${process.env.PAYLOAD_PUBLIC_SITE_URL}/api/preview?url=${formatAppURL({ doc })}`,
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (checkRole(['admin'], req.user)) return true; // Admins can read all profiles
      return { user: { equals: req.user.id } }; // Users can only read their own profile
    },
    create: ({ req }) => !!req.user, // Any logged-in user can create a profile
    update: ({ req }) => {
      if (!req.user) return false;
      if (checkRole(['admin'], req.user)) return true; // Admins can update any profile
      return { user: { equals: req.user.id } }; // Users can update their own profile
    },
    delete: ({ req }) => checkRole(['admin'], req.user), // Only Admins can delete profiles
  },
  fields: [
    {
        name: 'firstname',
        type: 'text',
        required: true,
      },
      {
        name: 'lastname',
        type: 'text',
        required: true,
      },
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true, // Ensures no duplicate email addresses
      },
      {
        name: 'phone',
        type: 'text',
        required: true,
      },
      {
        name: 'gradeOrDesignation',
        label: 'Grade/Designation',
        type: 'text',
        required: false,
      },
      {
        name: 'institutionOrOrganization',
        label: 'Institution/Organization',
        type: 'text',
        required: false,
      },
      {
        name: 'intro',
        type: 'richText',
        required: false,
        admin: {
          elements: ['h2', 'h3', 'link'], 
        },
      },
      {
        name: 'linkedin',
        label: 'LinkedIn URL',
        type: 'text',
        required: false,
        admin: {
          placeholder: 'https://www.linkedin.com/in/your-profile',
        },
      },
      {
        name: 'instagram',
        label: 'Instagram URL',
        type: 'text',
        required: false,
        admin: {
          placeholder: 'https://www.instagram.com/your-profile',
        },
      },
      {
        name: 'x',
        label: 'X (Twitter) URL',
        type: 'text',
        required: false,
        admin: {
          placeholder: 'https://twitter.com/your-profile',
        },
      },
      {
        name: 'user',
        type: 'relationship',
        relationTo: 'users',
        required: true,
        admin: {
          position: 'sidebar',
        },
        access: {
          read: admins,// Allow users to read who owns the profile
          create: ({ req }) => !!req.user, // Ensure it's set when creating a profile
          update: ({ req }) => req.user && req.user.id, // Users can update only their own profile
        },
      },
      
      slugField(),
  ],
}

export default Profiles;
