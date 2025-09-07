import { configureStore } from '@reduxjs/toolkit'
import uiSlice, {
  setTheme,
  toggleTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  setLoading,
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  updateLastActivity,
  setOnlineStatus,
  resetUI,
} from '../uiSlice'

describe('UI Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiSlice,
      },
    })
  })

  describe('Theme actions', () => {
    it('should set theme', () => {
      const newTheme = {
        mode: 'dark' as const,
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
      }

      store.dispatch(setTheme(newTheme))
      const state = store.getState().ui

      expect(state.theme).toEqual(newTheme)
    })

    it('should toggle theme', () => {
      const initialState = store.getState().ui
      expect(initialState.theme.mode).toBe('light')

      store.dispatch(toggleTheme())
      let state = store.getState().ui
      expect(state.theme.mode).toBe('dark')

      store.dispatch(toggleTheme())
      state = store.getState().ui
      expect(state.theme.mode).toBe('light')
    })
  })

  describe('Language actions', () => {
    it('should set language', () => {
      const newLanguage = {
        code: 'en-US',
        name: 'English',
        flag: '🇺🇸',
      }

      store.dispatch(setLanguage(newLanguage))
      const state = store.getState().ui

      expect(state.language).toEqual(newLanguage)
    })
  })

  describe('Sidebar actions', () => {
    it('should toggle sidebar', () => {
      const initialState = store.getState().ui
      expect(initialState.sidebarOpen).toBe(true)

      store.dispatch(toggleSidebar())
      let state = store.getState().ui
      expect(state.sidebarOpen).toBe(false)

      store.dispatch(toggleSidebar())
      state = store.getState().ui
      expect(state.sidebarOpen).toBe(true)
    })

    it('should set sidebar open state', () => {
      store.dispatch(setSidebarOpen(false))
      let state = store.getState().ui
      expect(state.sidebarOpen).toBe(false)

      store.dispatch(setSidebarOpen(true))
      state = store.getState().ui
      expect(state.sidebarOpen).toBe(true)
    })
  })

  describe('Notification actions', () => {
    it('should add notification', () => {
      const notification = {
        type: 'success' as const,
        title: 'Success',
        message: 'Operation completed successfully',
        duration: 5000,
      }

      store.dispatch(addNotification(notification))
      const state = store.getState().ui

      expect(state.notifications).toHaveLength(1)
      expect(state.notifications[0]).toMatchObject({
        ...notification,
        read: false,
      })
      expect(state.notifications[0].id).toBeDefined()
      expect(state.notifications[0].timestamp).toBeDefined()
    })

    it('should remove notification', () => {
      const notification = {
        type: 'error' as const,
        title: 'Error',
        message: 'Something went wrong',
      }

      store.dispatch(addNotification(notification))
      let state = store.getState().ui
      const notificationId = state.notifications[0].id

      store.dispatch(removeNotification(notificationId))
      state = store.getState().ui

      expect(state.notifications).toHaveLength(0)
    })

    it('should mark notification as read', () => {
      const notification = {
        type: 'info' as const,
        title: 'Info',
        message: 'Some information',
      }

      store.dispatch(addNotification(notification))
      let state = store.getState().ui
      const notificationId = state.notifications[0].id

      expect(state.notifications[0].read).toBe(false)

      store.dispatch(markNotificationAsRead(notificationId))
      state = store.getState().ui

      expect(state.notifications[0].read).toBe(true)
    })

    it('should mark all notifications as read', () => {
      store.dispatch(addNotification({
        type: 'success',
        title: 'Success 1',
        message: 'Message 1',
      }))
      store.dispatch(addNotification({
        type: 'error',
        title: 'Error 1',
        message: 'Message 2',
      }))

      let state = store.getState().ui
      expect(state.notifications.every(n => n.read)).toBe(false)

      store.dispatch(markAllNotificationsAsRead())
      state = store.getState().ui

      expect(state.notifications.every(n => n.read)).toBe(true)
    })

    it('should clear all notifications', () => {
      store.dispatch(addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Some warning',
      }))

      let state = store.getState().ui
      expect(state.notifications).toHaveLength(1)

      store.dispatch(clearNotifications())
      state = store.getState().ui

      expect(state.notifications).toHaveLength(0)
    })

    it('should limit notifications to 100', () => {
      // Add 101 notifications
      for (let i = 0; i < 101; i++) {
        store.dispatch(addNotification({
          type: 'info',
          title: `Notification ${i}`,
          message: `Message ${i}`,
        }))
      }

      const state = store.getState().ui
      expect(state.notifications).toHaveLength(100)
    })
  })

  describe('Loading actions', () => {
    it('should set loading state for specific key', () => {
      store.dispatch(setLoading({ key: 'wallet', value: true }))
      let state = store.getState().ui
      expect(state.loading.wallet).toBe(true)

      store.dispatch(setLoading({ key: 'voting', value: true }))
      state = store.getState().ui
      expect(state.loading.voting).toBe(true)
      expect(state.loading.wallet).toBe(true)

      store.dispatch(setLoading({ key: 'wallet', value: false }))
      state = store.getState().ui
      expect(state.loading.wallet).toBe(false)
      expect(state.loading.voting).toBe(true)
    })

    it('should set global loading state', () => {
      store.dispatch(setGlobalLoading(true))
      let state = store.getState().ui
      expect(state.loading.global).toBe(true)

      store.dispatch(setGlobalLoading(false))
      state = store.getState().ui
      expect(state.loading.global).toBe(false)
    })
  })

  describe('Modal actions', () => {
    it('should open modal', () => {
      store.dispatch(openModal('walletConnect'))
      let state = store.getState().ui
      expect(state.modals.walletConnect).toBe(true)

      store.dispatch(openModal('nftTransfer'))
      state = store.getState().ui
      expect(state.modals.nftTransfer).toBe(true)
    })

    it('should close modal', () => {
      store.dispatch(openModal('walletConnect'))
      let state = store.getState().ui
      expect(state.modals.walletConnect).toBe(true)

      store.dispatch(closeModal('walletConnect'))
      state = store.getState().ui
      expect(state.modals.walletConnect).toBe(false)
    })

    it('should close all modals', () => {
      store.dispatch(openModal('walletConnect'))
      store.dispatch(openModal('nftTransfer'))
      store.dispatch(openModal('tokenStake'))
      let state = store.getState().ui
      expect(state.modals.walletConnect).toBe(true)
      expect(state.modals.nftTransfer).toBe(true)
      expect(state.modals.tokenStake).toBe(true)

      store.dispatch(closeAllModals())
      state = store.getState().ui
      expect(state.modals.walletConnect).toBe(false)
      expect(state.modals.nftTransfer).toBe(false)
      expect(state.modals.tokenStake).toBe(false)
    })
  })

  describe('Breadcrumb actions', () => {
    it('should set breadcrumbs', () => {
      const breadcrumbs = [
        { label: 'Home', path: '/' },
        { label: 'Voting', path: '/voting' },
        { label: 'Create', path: '/voting/create' },
      ]

      store.dispatch(setBreadcrumbs(breadcrumbs))
      const state = store.getState().ui

      expect(state.breadcrumbs).toEqual(breadcrumbs)
    })

    it('should add breadcrumb', () => {
      const breadcrumb = { label: 'New Page', path: '/new' }

      store.dispatch(addBreadcrumb(breadcrumb))
      const state = store.getState().ui

      expect(state.breadcrumbs).toHaveLength(1)
      expect(state.breadcrumbs[0]).toEqual(breadcrumb)
    })

    it('should remove breadcrumb by index', () => {
      store.dispatch(setBreadcrumbs([
        { label: 'Home', path: '/' },
        { label: 'Voting', path: '/voting' },
        { label: 'Create', path: '/voting/create' },
      ]))

      store.dispatch(removeBreadcrumb(1))
      const state = store.getState().ui

      expect(state.breadcrumbs).toHaveLength(2)
      expect(state.breadcrumbs[0].label).toBe('Home')
      expect(state.breadcrumbs[1].label).toBe('Create')
    })
  })

  describe('Activity and online status actions', () => {
    it('should update last activity', () => {
      const beforeTime = Date.now()
      store.dispatch(updateLastActivity())
      const state = store.getState().ui
      const afterTime = Date.now()

      expect(state.lastActivity).toBeGreaterThanOrEqual(beforeTime)
      expect(state.lastActivity).toBeLessThanOrEqual(afterTime)
    })

    it('should set online status', () => {
      store.dispatch(setOnlineStatus(false))
      let state = store.getState().ui
      expect(state.online).toBe(false)

      store.dispatch(setOnlineStatus(true))
      state = store.getState().ui
      expect(state.online).toBe(true)
    })
  })

  describe('Reset action', () => {
    it('should reset UI state', () => {
      // Set some state
      store.dispatch(toggleSidebar())
      store.dispatch(addNotification({
        type: 'info',
        title: 'Test',
        message: 'Test message',
      }))
      store.dispatch(openModal('walletConnect'))
      store.dispatch(setBreadcrumbs([{ label: 'Test', path: '/test' }]))

      let state = store.getState().ui
      expect(state.sidebarOpen).toBe(false)
      expect(state.notifications).toHaveLength(1)
      expect(state.modals.walletConnect).toBe(true)
      expect(state.breadcrumbs).toHaveLength(1)

      store.dispatch(resetUI())
      state = store.getState().ui

      expect(state.sidebarOpen).toBe(true)
      expect(state.notifications).toHaveLength(0)
      expect(state.modals.walletConnect).toBe(false)
      expect(state.breadcrumbs).toHaveLength(0)
      expect(state.loading.global).toBe(false)
    })
  })
})
