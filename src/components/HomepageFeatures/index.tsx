import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '开箱即用',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        通过简单的配置，你的应用就可以拥有, 健康检查, API文档, 应用自定义监控, 分布式链路追踪等功能。
      </>
    ),
  },
  {
    title: '组件丰富',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        应用开发中常见的功能组件, 比如MySQL,Kafka,Redis,分布式缓存, 分布式锁, 都可以配置后直接使用。
      </>
    ),
  },
  {
    title: '架构优良',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        既可开发单体架构应用，也可开发微服务架构应用, 并且使用该框架开发的单体服务可以无缝迁移成微服务。再也不用担心服务拆分的问题了。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
