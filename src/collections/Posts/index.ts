import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrPublished } from '../../access/adminsOrPublished'
import { Archive } from '../../blocks/Archive'
import { CallToAction } from '../../blocks/CallToAction'
import { Content } from '../../blocks/Content'
import { FormBlock } from '../../blocks/Form'
import { MediaBlock } from '../../blocks/Media'
import { hero } from '../../fields/hero'
import { slugField } from '../../fields/slug'
import { populateArchiveBlock } from '../../hooks/populateArchiveBlock'
import { populatePublishedDate } from '../../hooks/populatePublishedDate'
import { formatAppURL, revalidatePage } from '../../hooks/revalidatePage'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    preview: doc =>
      `${process.env.PAYLOAD_PUBLIC_SITE_URL}/api/preview?url=${formatAppURL({ doc })}`,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (operation === 'create') {
          return {
            ...data,
            owner: req.user.id, // Assign the owner automatically
          };
        }
        return data;
      },
    ],
    afterRead: [populateArchiveBlock],
    afterChange: [revalidatePage],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => {
      if (req.user.role === 'admin') return true; // Admins can read all
      return { owner: { equals: req.user.id } }; // Users can only read their own items
    },
    update: ({ req }) => {
      if (req.user.role === 'admin') return true;
      return { owner: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (req.user.role === 'admin') return true;
      return { owner: { equals: req.user.id } };
    },
    create: ({ req }) => !!req.user, // Any authenticated user can create
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users', // This links to the users collection
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [hero],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              required: true,
              blocks: [CallToAction, Content, FormBlock, MediaBlock, Archive],
            },
          ],
        },
      ],
    },
    slugField(),
  ],

}