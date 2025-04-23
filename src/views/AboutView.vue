<template>
  <div class="about-view">
    <el-card class="about-card" shadow="hover">
      <template #header>
        <div class="about-header">
          <h2>关于 DORO 表情包收集</h2>
          <span class="datetime">{{ currentDateTime }}</span>
        </div>
      </template>

      <div class="about-content">
        <div class="project-intro">
          <h3>项目介绍</h3>
          <p>DORO表情包收集是一个开源的表情包收集与分享平台，旨在为用户提供便捷的表情包管理和获取服务。</p>
          <p>本项目基于Vue 3、TypeScript和Element Plus开发，支持表情包的上传、分类、搜索、收藏和批量下载等功能。</p>

          <h4>主要功能：</h4>
          <ul>
            <li>多种展示模式：网格、列表、瀑布流</li>
            <li>表情包交互：点赞、踩功能，带动画效果</li>
            <li>详细信息：查看和编辑表情包描述、标签</li>
            <li>搜索筛选：按描述、标签快速查找</li>
            <li>批量下载：选中多个表情包打包下载</li>
            <li>深浅模式：根据个人习惯切换主题</li>
          </ul>
        </div>

        <div class="project-info">
          <h3>项目信息</h3>
          <p>
            <strong>版本：</strong> 1.0.0<br>
            <strong>开发者：</strong> <a href="https://github.com/xihan123" target="_blank">xihan123</a><br>
            <!--            <strong>开源协议：</strong> MIT<br>-->
            <!--            <strong>代码仓库：</strong> <a href="https://github.com/xihan123/doro-collector-api"-->
            <!--                                          target="_blank">GitHub</a><br>-->
            <!--            <strong>当前用户：</strong> {{ currentUser }}-->
          </p>
        </div>

        <el-divider/>

        <div class="sponsors">
          <h3>服务器赞助商</h3>
          <div class="sponsor-list">
            <a href="https://www.zovps.com" target="_blank" class="sponsor-item">
              <el-card shadow="hover" class="sponsor-card">
                <div class="sponsor-content">
                  <img src="@/assets/ciyun.png" alt="词云图片" class="sponsor-image"/>
                  <div class="sponsor-info">
                    <h4>ZOVPS 慈云数据</h4>
                    <p>提供高性能云计算服务支持</p>
                    <el-button type="primary" size="small">访问官网</el-button>
                  </div>
                </div>
              </el-card>
            </a>
          </div>
        </div>

        <div class="feedback">
          <h3>问题反馈</h3>
          <p>如果您在使用过程中遇到任何问题，或有功能建议，欢迎通过以下方式联系我们：</p>
          <ul>
            <li>在GitHub上<a href="https://github.com/xihan123/doro-collector-api/issues" target="_blank">提交Issue</a>
            </li>
            <!--            <li>发送邮件至：<a href="mailto:contact@example.com">contact@example.com</a></li>-->
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';

// 当前日期和时间
const currentDateTime = ref('2025-04-23 17:17:17');

// 当前用户
const currentUser = ref('xihan123');
</script>

<style lang="scss" scoped>
.about-view {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;

  .about-card {
    .about-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-weight: 500;
      }

      .datetime {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .about-content {
      color: var(--el-text-color-primary);

      h3 {
        font-size: 20px;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 500;
      }

      h4 {
        font-size: 18px;
        margin-top: 20px;
        margin-bottom: 12px;
        font-weight: 500;
      }

      p {
        line-height: 1.6;
        margin-bottom: 16px;
      }

      ul {
        padding-left: 20px;
        margin-bottom: 16px;

        li {
          line-height: 1.8;
        }
      }

      a {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .sponsors {
        .sponsor-list {
          margin: 20px 0;

          .sponsor-item {
            display: block;
            text-decoration: none;
            color: var(--el-text-color-primary);
            transition: all 0.3s;

            &:hover {
              transform: translateY(-5px);
            }

            .sponsor-card {
              .sponsor-content {
                display: flex;
                align-items: center;
                gap: 20px;

                .sponsor-image {
                  width: 200px;
                  height: auto;
                  object-fit: contain;
                  border-radius: 4px;
                }

                .sponsor-info {
                  h4 {
                    margin-top: 0;
                    color: var(--el-color-primary);
                  }

                  p {
                    margin-bottom: 15px;
                  }
                }
              }
            }
          }
        }
      }

      .project-info, .project-intro, .sponsors, .feedback {
        margin-bottom: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  .about-view {
    padding: 0 10px;

    .about-card {
      .about-header {
        flex-direction: column;
        align-items: flex-start;

        .datetime {
          margin-top: 5px;
        }
      }

      .about-content {
        .sponsors {
          .sponsor-list {
            .sponsor-item {
              .sponsor-card {
                .sponsor-content {
                  flex-direction: column;
                  text-align: center;

                  .sponsor-image {
                    width: 100%;
                    max-width: 300px;
                    margin: 0 auto;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>