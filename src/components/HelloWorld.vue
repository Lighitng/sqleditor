<template>
  <el-container>
    <el-aside width="200px">
      <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose">
            <el-submenu v-for="(db, db_index) in databases" :index="db_index.toString()" :key="db.name" style="text-align: left;">
              <template slot="title">
                <span>
                  <i>
                    <svg t="1591377619704" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1230" width="1.5rem" height="1.5rem"><path d="M160 320c0-94.624 153.312-157.664 341.504-159.936L512 160c189.44 0 346.208 61.344 351.84 154.784L864 320v384c0 96.384-159.04 160-352 160S160 800.384 160 704V320z m352 286.624c-118.4 0-224.064-24-288-64.768V576c0 44.992 127.488 96 288 96s288-51.008 288-96l0.032-34.176c-63.936 40.8-169.6 64.8-288.032 64.8zM512 480c-118.4 0-224.064-23.968-288-64.768v31.36c0 45.024 127.488 96 288 96s288-50.976 288-96l0.032-31.36C736.096 456 630.432 480 512 480z m0-256c-160.512 0-288 51.008-288 96s127.488 96 288 96 288-51.008 288-96-127.488-96-288-96z m0 576c160.512 0 288-51.008 288-96l0.032-32.768C736.096 712 630.432 736 512 736c-118.4 0-224.064-23.968-288-64.768V704c0 44.992 127.488 96 288 96z" p-id="1231"></path></svg>
                  </i>
                  {{ db.name }}
                </span>
              </template>
              <el-menu-item-group>
                <el-menu-item v-for="(table, t_index) in db.tables" :index="t_index.toString()" @click="getTableDetails(db_index, t_index)" :key="db.name + t_index">
                  <i class="el-icon-tickets"></i>
                  {{ table }}
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>
      </el-menu>
      <div class="aside-hover" v-if="databases.length <= 0">
        <el-button type="text" @click="dialogFormVisible = true">请先输入连接信息</el-button>
      </div>
    </el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <div id="editor">
          <editor v-model="content"
                  @init="editorInit"
                  lang="sql"
                  theme="twilight"
                  width="100%"
                  height="100%"
                  :options="editor_options"
                  style="font-size: 1em;"
          ></editor>
        </div>
      </el-main>
      <el-footer>
        <el-tabs type="border-card" style="height: 100%;">
          <el-tab-pane label="结果">
            <p v-if="result.loading">Executing SQL...</p>
            <vtable v-if="result.tableData.length > 0" :table-data="result.tableData" :columns="result.columns"></vtable>
          </el-tab-pane>
        </el-tabs>
        <el-button type="primary" class="btn-submit" @click="submitRunSQL">提交运行</el-button>
      </el-footer>
    </el-container>
    <el-dialog title="连接" :visible.sync="dialogFormVisible">
      <el-form :model="connection" label-position="top" label-width="60px" style="text-align: center;">
        <el-form-item label="主机">
          <el-input v-model="connection.host" :disabled="true" auto-complete="off"></el-input>
         </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="connection.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="connection.password" type="password" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align: center;">
        <el-button type="primary" @click="connectDB">连 接</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
  import Backend from "@/components/Backend.js"
  import Table from "@/components/Table.vue"
  export default {
    name: 'HelloWorld',
    components: {
      'editor': require('vue2-ace-editor'),
      'vtable': Table
    },
    data () {
      return {
        dialogFormVisible: false,
        connection: {
          host: 'host',
          username: '',
          password: '',
          key: ''
        },
        editor_options: {
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true
        },
        content: "write your sql here",
        databases: [],
        result: {
          columns: [],
          // result set
          tableData: [],
          msg: "",
          loading: false,
        },
      }
    },
    methods: {
      connectDB: function() {
        console.log('DB connected')
        this.dialogFormVisible = !this.dialogFormVisible
        this.databases = [{
          name: 'db1',
          tables: ['db1-table1', 'db1-table2']
        }, {
          name: 'db2',
          tables: ['db2-table1', 'db2-table2', 'db2-table3']
        }]
      },
      editorInit: function () {
        require('brace/ext/language_tools')
        require('brace/mode/sql')
        require('brace/theme/twilight')
      },
      submitRunSQL: function (event) {
        if (this.connection.key == '') {
          this.dialogFormVisible = true
          this.$message.error({
            message: "请先进行连接",
            customClass: "el-message"
          });
          return
        }
        const self = this
        self.result.loading = true
    
        //clean preview table
        self.result.tableData = []
        self.result.columns = []
        //clean preview msg
        self.result.msg = ""
    
        // let selectContent = self.holder.tool().selection()
        let sql = self.content
    
        const backend = new Backend(self.$http)
    
        const res = backend.submitJob({
          "sql": sql,
          "user": "root",
        }, function () {
          self.result.loading = true
        }, function () {
          self.result.loading = false
        }, function (msg) {
          self.result.loading = false
          self.result.msg = msg
        }, true)
    
        self.result.columns = res["columns"]
        self.result.tableData = res["tableData"]
      },
      handleOpen: function(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose: function(key, keyPath) {
        console.log(key, keyPath);
      },
      getTableDetails: function(db_index, table_index) {
        console.log("You clicked table ", this.$data.databases[db_index].tables[table_index])
      }
    },
  }
</script>

<style>
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 6rem;
    min-height: 6rem;
  }
  .el-footer {
    background-color: #FFF;
    color: #333;
    text-align: center;
    min-height: 20rem;
    padding: 2px;
  }
  .el-aside {
    background-color: #FFF;
    color: #333;
    text-align: center;
    line-height: 56rem;
    min-height: 56rem;
  }
  
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 30rem;
    padding: 0;
  }
  
  body > .el-container {
    margin-bottom: 0px;
  }
  
  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }
  
  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
  
  .el-dialog {
    width: 30rem;
  }
  .el-input {
    width: 85%;
  }
  
  #editor {
    width: 100%;
    height: 100%;
  }
  
  .el-message {
    z-index: 99999 !important;
  }
  
  .btn-submit {
    position: absolute;
    bottom: 19rem;
    right: 1rem;
  }
  .aside-hover {
    text-align: center;
    height: 100%;
    width: 100%;
    background-color: rgba(211, 220, 230, 0.2);
  }
</style>
