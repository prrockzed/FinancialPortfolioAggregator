import { createContext, useContext, useState, useEffect } from 'react'
import { fetchUsers } from '../api/client'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('all')

  useEffect(() => {
    fetchUsers().catch(() => {})
      .then((data) => { if (data) setUsers(data) })
  }, [])

  return (
    <UserContext.Provider value={{ users, selectedUserId, setSelectedUserId }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
