import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Card from "../../components/Card";
import Layout from "../../components/Layout";
import { siteConfig } from "../../site.config";
import { IndexProps, Params, TagProps } from "../../types/types";
import { fetchPages } from "../../utils/notion";
import { getMultiSelect } from "../../utils/property";
import { sampleCards } from "../../utils/sample";

export const getStaticPaths: GetStaticPaths = async () => {
  const { results }: { results: Record<string, any>[] } = await fetchPages({});

  const pathSet: Set<string> = new Set();
  for (const page of results) {
    for (const tag of getMultiSelect(page.properties.tags.multi_select)) {
      pathSet.add(tag);
    }
  }

  const paths = Array.from(pathSet).map((tag) => {
    return {
      params: {
        tag: tag,
      },
    };
  });

  return {
    paths: paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { tag } = ctx.params as Params;
  const { results } = await fetchPages({ tag: tag });

  const { results: pagesResults }: any = await fetchPages({});

  const pathSet: Set<string> = new Set();
  for (const page of pagesResults) {
    for (const tag of getMultiSelect(page.properties.tags.multi_select)) {
      pathSet.add(tag);
    }
  }

  return {
    props: {
      pages: results ? results : [],
      tag: tag,
      tags: pathSet ? Array.from(pathSet) : [],
    },
    revalidate: 10,
  };
};

const Tag: NextPage<TagProps> = ({ pages, tag, tags }) => {
  return (
    <Layout>
      <div className="pt-12">
        <h1 className="text-5xl mb-8">{`#${tag}`}</h1>
        <div className="grid md:grid-cols-3 md:gap-6 my-12 justify-center">
          <div className="grid md:gap-6 md:grid-cols-2 w-full md:col-span-2 col-span-3">
            {/* Card */}
            {pages.map((page, index) => (
              <Card key={index} page={page} />
            ))}
          </div>
          <div className="col-span-3 md:col-span-1 max-w-xl w-full flex flex-wrap content-start gap-2">
            {tags?.map((tag, index) => (
              <div key={index}>
                <Link href={`/tags/${tag}`}>
                  <a>
                    <span
                      key={index}
                      className="text-sm px-2 py-1 font-normal bg-gray-600 text-gray-200 rounded-lg break-words"
                    >
                      {`#${tag}`}
                    </span>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tag;
