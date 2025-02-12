import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { anyone } from '../../access/anyone'
import adminsAndUser from './access/adminsAndUser'
import { checkRole } from './checkRole'
import { ensureFirstUserIsAdmin } from './hooks/ensureFirstUserIsAdmin'
import { adminsOrPublished } from '../../access/adminsOrPublished'
import { Payload } from 'payload'

// Helper function to check if user is an admin or editor
const adminsAndEditors = ({ req: { user } }) => {
  return checkRole(['admin', 'editor'], user)
}

export const UserFields: CollectionConfig['fields'] = [
  {
    name: 'name',
    type: 'text',
  },
  {
    name: 'profile', 
    type: 'relationship',
    relationTo: 'profiles',
    hasMany: true,
  },
  {
    name: 'roles',
    type: 'select',
    hasMany: true,
    saveToJWT: true,
    hooks: {
      beforeChange: [ensureFirstUserIsAdmin],
    },
    defaultValue: ['user'],
    options: [
      {
        label: 'admin',
        value: 'admin',
      },
      {
        label: 'editor',
        value: 'editor',
      },
      {
        label: 'user',
        value: 'user',
      },
    ],
    access: {
      read: admins, // Admins and Editors can read roles
      create: admins, // Only Admins can create roles
      update: admins, // Editors and Admins can update roles
    },
  },
]

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles'],
  },
  access: {
    read: admins,
    create: admins,
    update: admins, // Editors can update but not delete
    delete: admins, // Only Admins can delete users
    admin: ({ req: { user } }) => checkRole(['admin', 'editor'], user), // Allow editors to access dashboard
  },
  auth: true,
  hooks: {
    afterChange: [
      async ({ operation, req, doc }) => {
        if (operation === 'create') {
          const payload: Payload = req.payload

          // Check if the user already has a profile
          const existingProfile = await payload.find({
            collection: 'profiles',
            where: { user: { equals: doc.id } },
          })

          if (!existingProfile.docs.length) {
            // Create a profile and link it to the new user
            const newProfile = await payload.create({
              collection: 'profiles',
              data: {
                user: doc.id,
                firstname: doc.name || '', // Default values
                lastname: 'test',
                email: doc.email || '',
                phone: '9876543234',
                linkedin: 'www.sampleurl.com',
                instagram: 'www.sampleurl.com',
                x: 'www.sampleurl.com',
              },
            })

            // Update the user document with the created profile ID
            await payload.update({
              collection: 'users',
              id: doc.id,
              data: {
                profile: newProfile.id,
              },
            })
          }
        }
      },
    ],
  },
  fields: UserFields,
  timestamps: true,
}

export default Users