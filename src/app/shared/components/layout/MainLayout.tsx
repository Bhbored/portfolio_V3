import { Outlet } from "react-router-dom"
import NavMenu from "./NavMenu"
import Footer from "./Footer"
import SectionSideNav from "./SectionSideNav"

export default function MainLayout() {
  return (
    <div className="main-layout min-w-0 max-w-full overflow-x-clip">
      <NavMenu />
      <SectionSideNav />
      <main className="min-w-0 max-w-full overflow-x-clip pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
