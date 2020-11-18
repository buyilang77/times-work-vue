const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  access_token: state => state.user.access_token,
  type: state => state.user.type,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  username: state => state.user.username,
  permission_routes: state => state.permission.routes,
  system_roles: state => state.user.system_roles,
  roles: state => state.user.roles
}
export default getters
