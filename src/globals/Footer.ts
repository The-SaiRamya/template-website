import type { GlobalConfig } from 'payload/types'
import { checkRole } from '../collections/Users/checkRole';
import link from '../fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: ({ req: { user } }) => checkRole(['admin'], user), 
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      maxRows: 6,
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
  ],
}