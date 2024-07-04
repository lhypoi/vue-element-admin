import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  dictObj: {
    userType: {
      '1': '普通用户',
      '2': '减脂老师',
      '3': '私密老师',
      '4': '减脂、私密老师',
      '5': '代理商'
    },
    userTeacherType: {
      '2': '减脂老师',
      '3': '私密老师',
      '4': '减脂、私密老师'
    },
    courseStatus: {
      '0': '未开始',
      '1': '进行中',
      '2': '已结束'
    },
    gender: {
      '1': '男',
      '2': '女'
    },
    boolean: {
      '1': '是',
      '2': '否'
    },
    courseType: {
      '2': '减脂',
      '3': '私密'
    },
    shitTimes: {
      '1': '0次',
      '2': '1-3次',
      '3': '3次以上'
    },
    drinkMeasure: {
      '1': '1500毫升以下',
      '2': '1500-2000毫升',
      '3': '2000-2500毫升',
      '4': '2500毫升以上'
    },
    plan: {
      '1': '匀速',
      '2': '高速',
      '3': '低速'
    },
    evaluation: {
      '1': '很满意',
      '2': '较为满意',
      '3': '不满意',
      '4': '很不满意'
    }
  }
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
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
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar, introduction } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

const getters = {
  dictFormOptions(state) {
    return Object.keys(state.dictObj).reduce((listObj, dictName) => ({
      ...listObj,
      [dictName]: Object.keys(state.dictObj[dictName]).map(key => ({
        id: key,
        name: state.dictObj[dictName][key]
      }))
    }), {})
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
