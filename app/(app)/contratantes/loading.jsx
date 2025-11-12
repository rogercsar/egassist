import Card from '../../../components/Card'

export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded" />
      <Card>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </Card>
    </div>
  )
}