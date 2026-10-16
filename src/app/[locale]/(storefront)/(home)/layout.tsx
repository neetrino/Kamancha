type HomeLayoutProps = {
  children: React.ReactNode;
};

/**
 * Hub lives at `/` without the delivery hero chrome.
 */
export default function HomeLayout({ children }: HomeLayoutProps) {
  return children;
}
