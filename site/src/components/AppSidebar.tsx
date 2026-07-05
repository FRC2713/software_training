import { NavLink, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { lessons } from '@/lib/lessons'

// The lesson titles already read "Lesson N: ..."; the sidebar shows its own
// number badge, so strip the redundant prefix from the label.
const shortTitle = (title: string) => title.replace(/^Lesson\s+\d+:\s*/, '')

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3 text-base font-semibold text-foreground">
        FRC 2713 Training
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <NavLink to="/">All lessons</NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {lessons.map((lesson, i) => {
                const to = `/lesson/${lesson.slug}`
                const active = pathname === to || pathname.startsWith(`${to}/`)
                return (
                  <SidebarMenuItem key={lesson.slug}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={to}>
                        <span className="w-5 shrink-0 text-right font-medium tabular-nums text-primary">
                          {i + 1}
                        </span>
                        <span className="truncate">{shortTitle(lesson.title)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
