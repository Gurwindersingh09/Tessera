/**
 * @file index.js  —  Sentinel feature barrel export
 *
 * Import everything your app needs from a single point:
 *
 *   import { CaseDashboard, Sidebar, useSentinelStore } from './features/sentinel';
 *
 * Then add routes + layout as described in INTEGRATION.md.
 */

export { default as CaseDashboard }    from './pages/CaseDashboard';
export { default as Sidebar }          from './components/Sidebar';
export { useSentinelStore }            from './store/useSentinelStore';
