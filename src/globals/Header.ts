import type { GlobalConfig } from 'payload/types'
import { checkRole } from '../collections/Users/checkRole';
import link from '../fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
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

export default Header;