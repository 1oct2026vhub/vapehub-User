import { useCallback, useState } from 'react'
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/lib/server.actions'
import { UserProfileFormData, UserProfileResponse } from '@/lib/config/user.config'
import { ServerActionStatus } from '../config/app.config'
import { toast } from 'sonner'

export const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (): Promise<UserProfileResponse | null> => {
    setIsLoading(true)
    try {
      const response = await getUserProfile()
      if (response.status === ServerActionStatus.ERROR) {
        return null
      }
        
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: UserProfileFormData) => {
    setIsLoading(true)
    try {
      const response = await updateUserProfile(data)
      if (response.status === ServerActionStatus.ERROR) throw new Error(response.message)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await deleteUserAccount()
      if (response.status === ServerActionStatus.ERROR) {
        toast.error(response.message);
        return null;
      } else {        
        return response;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    deleteProfile
  }
}