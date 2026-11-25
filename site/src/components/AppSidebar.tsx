import { Check } from 'lucide-react'
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
import { lessons, lessonSections } from '@/lib/lessons'
import { useProgress } from '@/lib/progress'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { isCompleted, user } = useProgress()

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-3 text-base font-semibold text-foreground">
        FRC 2713 Training
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <NavLink to="/">All lessons</NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {lessonSections.map((section) => {
          const doneInSection = section.lessons.filter((l) => isCompleted(l.slug)).length
          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="justify-between">
                <span>{section.title}</span>
                {user && (
                  <span className="tabular-nums text-[11px] font-normal text-muted-foreground">
                    {doneInSection}/{section.lessons.length}
                  </span>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.lessons.map((lesson) => {
                    const to = `/lesson/${lesson.slug}`
                    const active = pathname === to || pathname.startsWith(`${to}/`)
                    const done = isCompleted(lesson.slug)
                    return (
                      <SidebarMenuItem key={lesson.slug}>
                        <SidebarMenuButton asChild isActive={active}>
                          <NavLink to={to}>
                            <span className="w-5 shrink-0 text-right font-medium tabular-nums text-primary">
                              {lessons.indexOf(lesson) + 1}
                            </span>
                            <span className="truncate flex-1">{lesson.title}</span>
                            {done && (
                              <Check
                                className="size-3.5 shrink-0 text-[var(--ok)]"
                                aria-label="Completed"
                              />
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
