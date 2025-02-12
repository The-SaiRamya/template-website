import type { CollectionConfig } from 'payload/types'
import { checkRole } from '../collections/Users/checkRole';

const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => checkRole(['admin'], user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
  ],
}

export default Categories