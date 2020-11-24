import { login, logout, getInfo } from '@/api/user'
import { fetchRoles } from '@/api/role'
import { getAccessToken, setAccessToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    access_token: getAccessToken(),
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: '',
    username: '',
    type: '',
    user_id: '',
    system_roles: [],
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_ACCESS_TOKEN: (state, access_token) => {
    state.access_token = access_token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USER_ID: (state, user_id) => {
    state.user_id = user_id
  },
  SET_USERNAME: (state, username) => {
    state.username = username
  },
  SET_TYPE: (state, type) => {
    state.type = type
  },
  SET_SYSTEM_ROLES: (state, system_roles) => {
    state.system_roles = system_roles
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        commit('SET_ACCESS_TOKEN', response.access_token)
        setAccessToken(response.access_token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get system roles
  getRole({ commit }) {
    return new Promise((resolve, reject) => {
      fetchRoles().then(response => {
        commit('SET_SYSTEM_ROLES', response.data)
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const { id, name, username, type, roles } = response.data
        const role_text = roles.map(item => {
          return this.getters.system_roles.filter(role => role['id'] === item)[0].role_key
        })
        commit('SET_USER_ID', id)
        commit('SET_ROLES', role_text)
        commit('SET_NAME', name)
        commit('SET_USERNAME', username)
        commit('SET_TYPE', type)
        resolve(response.data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

