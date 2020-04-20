<template>
  <div class="draft-list">
    <div v-if="list.length" class="draft">
      <div class="title">
        我的草稿<span class="count">({{ total }})</span>
        <!-- <Button size="small" class="btn">舍弃全部草稿</Button> -->
      </div>
      <div v-for="(item, index) in list" :key="index">
        <Divider />
        <div class="draft-title" @click="editDraft(item.id)">{{ item.title }}</div>
        <div>
          <span>保存于{{ item.updatedAt.substring(0, 10) }} {{ item.updatedAt.substring(11, 19) }}</span>
          <span class="float-right">
            <span class="bright-btn" @click="editDraft(item.id)">编辑</span>
            <Divider type="vertical" />
            <span class="muted-btn" @click="onDeleteClick(item.id, item.title)">舍弃</span>
          </span>
        </div>
      </div>
      <Page v-if="total > 10" :total="total" :current="currentPage" show-elevator class="pagination"  @on-change="handlePage" />
    </div>
    <div v-else class="empty">暂无草稿！</div>
    <Modal
      v-model="showDeleteModal"
      title="舍弃草稿"
      :footer-hide="true"
      class="common-modal delete">
      <div class="tip">
        您确定要舍弃草稿「{{ curTitle }}」吗？
      </div>
      <div class="btn-container">
        <Button type="text" size="large" @click="onCancelClick" style="margin-left: 8px">取消</Button>
        <Button type="primary" size="large" @click="handleDeleteOne">舍弃</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    data () {
      return {
        list: [],
        total: 0,
        currentPage: 1,
        loading: false,
        showDeleteModal: false,
        curId: '',
        curTitle: '',
      };
    },
    mounted () {
      this.fetchList();
    },
    methods:{
      ...mapActions('draft', [
        'getDraftList',
        'deleteDraft',
      ]),
      async fetchList(page = 1) {
        this.loading = true;
        const { rows, count } = await this.getDraftList({ page });
        this.list = rows;
        this.total = count;
        this.loading = false;
      },
      editDraft (id) {
        this.$router.push({
          name: 'article',
          query: {
            draftId: id,
          },
        });
      },
      onDeleteClick (id, title) {
        this.showDeleteModal = true;
        this.curId = id;
        this.curTitle = title;
      },
      onCancelClick () {
        this.showDeleteModal = false;
      },
      async handleDeleteOne () {
        const { code } = await this.deleteDraft({ id: this.curId });
        if (code === 200) {
          this.showDeleteModal = false;
          this.curId = '';
          this.curTitle = '';
        }
        this.fetchList();
      },
      handlePage (val) {
        this.currentPage = val;
        this.fetchList(val);
      },
    },
  };
</script>

<style lang="less">
@import '../styles/theme.less';

.draft-list {
  margin: 2rem auto;
  padding: 40px 60px;
  overflow: hidden;
  background-color: #fff;

  .hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .bright-btn {
    color: @primary-color;

    &:hover {
      color: @light-primary;
      .hover();
    }
  }

  .muted-btn {
    &:hover {
      color: @primary-color;
      .hover();
    }
  }

  .float-right {
    float: right;

    .ivu-divider-vertical {
      margin: 0 14px;
    }
  }

  .draft {
    &-title {
      margin-bottom: .5rem;
      font-size: 16px;
      color: @primary-color;

      &:hover {
        color: @light-primary;
        .hover();
      }
    }

    .title {
      font-size: 18px;
      font-weight: 500;

      .count {
        margin-left: 5px;
        color: @primary-color;
      }

      .btn {
        margin-left: 1rem;
        font-size: 12px;
      }
    }

    .pagination {
      margin-bottom: 1rem;
    }
  }
}

@media (min-width: 768px) {
    .draft-list {
      width: 600px;
    }
  }
  @media (min-width: 992px) {
    .draft-list {
      width: 800px;
    }
  }
  @media (min-width: 1200px) {
    .draft-list {
      width: 1140px;
    }
  }
</style>
