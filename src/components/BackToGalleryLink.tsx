import clsx from 'clsx'
import { FunctionalComponent } from 'preact'
import { Link } from 'preact-router'

type BackToGalleryLinkProps = {
  light?: boolean
}

const BackToGalleryLink: FunctionalComponent<BackToGalleryLinkProps> = ({
  light
}) => {
  return (
    <Link
      class={clsx('mt-4 underline font-medium', light && 'text-white')}
      href='/'
    >
      Back to Gallery
    </Link>
  )
}
export default BackToGalleryLink
