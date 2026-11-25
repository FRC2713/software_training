import { BookOpen, Check } from 'lucide-react'
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
  const baseUrl = import.meta.env.BASE_URL

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 justify-center border-b border-sidebar-border p-0">
        <NavLink
          to="/"
          className="flex h-full items-center gap-1 pr-3 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring"
        >
          <span className="brand-mark">
            <picture>
              <source
                srcSet={`${baseUrl}brand/2713-white.svg`}
                media="(prefers-color-scheme: dark)"
              />
              <img
                src={`${baseUrl}brand/2713-red.svg`}
                alt="Red Hawk Robotics 2713"
              />
            </picture>
          </span>
          <span className="brand-subheading whitespace-nowrap text-sm tracking-tight text-[var(--ink)]">
            Software Training
          </span>
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="pb-6">
        <SidebarGroup className="pb-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/'}
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--hawk-red)]"
                >
                  <NavLink to="/">
                    <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                    <span>All lessons</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {lessonSections.map((section) => {
          const doneInSection = section.lessons.filter((l) => isCompleted(l.slug)).length
          return (
            <SidebarGroup key={section.title} className="pt-2 pb-1">
              <SidebarGroupLabel className="brand-subheading justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{section.title}</span>
                {user && (
                  <span className="brand-figures text-[11px] font-normal text-muted-foreground">
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
                    const num = lessons.indexOf(lesson) + 1
                    return (
                      <SidebarMenuItem key={lesson.slug}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className="data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_var(--hawk-red)]"
                        >
                          <NavLink to={to} title={`${num}. ${lesson.title}`}>
                            <span className="brand-figures w-5 shrink-0 text-right text-xs font-semibold text-[var(--emphasis)]">
                              {num}
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
