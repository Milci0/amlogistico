export function sortDocuments(docs, sortBy) {
  const sorted = [...docs]
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'name-asc':
      return sorted.sort((a, b) => a.type.localeCompare(b.type))
    case 'last-edited':
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}
