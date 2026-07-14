import { useCallback, useEffect, useState } from 'react'
import * as documentsRepository from '../services/documentsRepository'

export default function useDocuments() {
  const [documents, setDocuments] = useState([])

  const refresh = useCallback(() => {
    setDocuments(documentsRepository.list())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveDocument = useCallback((doc) => {
    const saved = documentsRepository.save(doc)
    refresh()
    return saved
  }, [refresh])

  const removeDocument = useCallback((id) => {
    documentsRepository.remove(id)
    refresh()
  }, [refresh])

  return { documents, refresh, saveDocument, removeDocument }
}
