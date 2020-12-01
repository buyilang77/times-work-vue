const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  access_token: state => state.user.access_token,
  type: state => state.user.type,
  name: state => state.user.name,
  user_id: state => state.user.user_id,
  username: state => state.user.username,
  permission_routes: state => state.permission.routes,
  system_roles: state => state.user.system_roles,
  roles: state => state.user.roles
}
export default getters
