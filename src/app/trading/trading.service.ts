import { HttpStatus, Injectable } from '@nestjs/common';
import download from 'download';
import * as fs from 'fs';
import { cloneDeep, maxBy, minBy } from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import * as request from 'request';
import { Model } from 'mongoose';
import { Price } from '../../schemas/price';
import { Buy } from '../../schemas/buy';
import fetch from 'node-fetch';
import { TICKERS_MAPPINGS } from '../utils/constant';
import { BuyHistory } from '../../schemas/buy-sell-history';
import { History } from '../../schemas/history';
import { VnIndex } from '../../schemas/vnindex';

export const rounded = (value: number, decimals = 2) => {
  return Number(
    Math.round(Number(value.toString() + 'e' + decimals.toString())) +
      'e-' +
      decimals,
  );
};

@Injectable()
export class TradingService {
  constructor(
    @InjectModel('Price') private readonly priceModel: Model<Price>,
    @InjectModel('Buy') private readonly buyModel: Model<Buy>,
    @InjectModel('History') private readonly historyModel: Model<History>,
    @InjectModel('VnIndex') private readonly vnIndexModel: Model<VnIndex>,
    @InjectModel('BuyHistory')
    private readonly buyHistoryModel: Model<BuyHistory>,
  ) {}
  private fileUrl =
    'https://onedrive.live.com/download.aspx?resid=84BAFC883D166571!3890&ithint=file%2cxlsx&authkey=!ANv2ivUoTwcR1n8';

  public async downloadCsv() {
    return new Promise(async (res) => {
      res(fs.writeFileSync('/tmp/content.xlsx', await download(this.fileUrl)));
    });
  }
  public getByLastKey = (obj) => {
    let remainKey = '';
    Object.keys(obj).forEach((key) => {
      if (!key.includes('__EMPTY')) {
        remainKey = key;
      }
    });
    return obj?.[remainKey];
  };
  public customRawData(sheetChart, sheetTable) {
    return {
      chart: this.getChart(sheetChart),
      table: [
        {
          title: 'CHỨNG KHOÁN VIỆT NAM',
          rows: {
            header: [
              'Chỉ số chính',
              'Giá hiện tại',
              'Tăng / Giảm',
              'Giá trị giao dịch',
              'GTGD NDTNN',
            ],
            data: [
              {
                title: sheetTable?.[2]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[2]?.['__EMPTY_1'],
                increment: sheetTable?.[2]?.['__EMPTY_2'],
                decrement: sheetTable?.[2]?.['__EMPTY_3'] * 100,
                price: this.getByLastKey(sheetTable?.[2]),
                gtgd: sheetTable?.[2]?.['__EMPTY_5'],
              },
              {
                title: sheetTable?.[3]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[3]?.['__EMPTY_1'],
                increment: sheetTable?.[3]?.['__EMPTY_2'],
                decrement: sheetTable?.[3]?.['__EMPTY_3'] * 100,
                price: this.getByLastKey(sheetTable?.[3]),
                gtgd: sheetTable?.[3]?.['__EMPTY_5'],
              },
              {
                title: sheetTable?.[4]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[4]?.['__EMPTY_1'],
                increment: sheetTable?.[4]?.['__EMPTY_2'],
                decrement: sheetTable?.[4]?.['__EMPTY_3'] * 100,
                price: this.getByLastKey(sheetTable?.[4]),
                gtgd: sheetTable?.[4]?.['__EMPTY_5'],
              },
              {
                title: sheetTable?.[5]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[5]?.['__EMPTY_1'],
                increment: sheetTable?.[5]?.['__EMPTY_2'],
                decrement: sheetTable?.[5]?.['__EMPTY_3'] * 100,
                price: this.getByLastKey(sheetTable?.[5]),
                gtgd: sheetTable?.[5]?.['__EMPTY_5'],
              },
            ],
          },
        },
        {
          title: 'CHỨNG KHOÁN THẾ GIỚI',
          rows: {
            header: [
              'Chỉ số chính',
              'Giá hiện tại',
              'Tăng / Giảm',
              'Giá hôm qua',
              'Thay đổi hôm qua',
            ],
            data: [
              {
                title: sheetTable?.[8]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[8]?.['__EMPTY_1'],
                increment: sheetTable?.[8]?.['__EMPTY_2'],
                decrement: sheetTable?.[8]?.['__EMPTY_3'] * 100,
                yesterdayPrice: this.getByLastKey(sheetTable?.[8]),
                changeYesterday: sheetTable?.[8]?.['__EMPTY_4'],
                changeToday: sheetTable?.[8]?.['__EMPTY_5'] * 100,
              },
              {
                title: sheetTable?.[9]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[9]?.['__EMPTY_1'],
                increment: sheetTable?.[9]?.['__EMPTY_2'],
                decrement: sheetTable?.[9]?.['__EMPTY_3'] * 100,
                yesterdayPrice: this.getByLastKey(sheetTable?.[9]),
                changeYesterday: sheetTable?.[9]?.['__EMPTY_4'],
                changeToday: sheetTable?.[9]?.['__EMPTY_5'] * 100,
              },
              {
                title: sheetTable?.[10]?.['BẢN TIN THỊ TRƯỜNG NGÀY'],
                now: sheetTable?.[10]?.['__EMPTY_1'],
                increment: sheetTable?.[10]?.['__EMPTY_2'],
                decrement: sheetTable?.[10]?.['__EMPTY_3'] * 100,
                yesterdayPrice: this.getByLastKey(sheetTable?.[10]),
                changeYesterday: sheetTable?.[10]?.['__EMPTY_4'],
                changeToday: sheetTable?.[10]?.['__EMPTY_5'] * 100,
              },
            ],
          },
        },
      ],
    };
  }
  public getChart(rawData: any) {
    const vnIndex = rawData.filter((item) => item[' Sàn '] === 'HSX');
    const vn30 = rawData.filter((item) => !!item[' vn30check ']);
    return [
      {
        total: vnIndex.length,
        title: 'VNINDEX',
        value: [
          {
            title: 'Mã tăng',
            value:
              vnIndex.filter((item) => item['% Tang gia '] > 0)?.length || 0,
          },
          {
            title: 'Mã giảm',
            value:
              vnIndex.filter((item) => item['% Tang gia '] < 0)?.length || 0,
          },
          {
            title: 'Không đổi',
            value:
              vnIndex.filter((item) => item['% Tang gia '] === 0)?.length || 0,
          },
        ],
      },
      {
        total: vn30.length,
        title: 'VN30',
        value: [
          {
            title: 'Mã tăng',
            value: vn30.filter((item) => item['% Tang gia '] > 0)?.length || 0,
          },
          {
            title: 'Mã giảm',
            value: vn30.filter((item) => item['% Tang gia '] < 0)?.length || 0,
          },
          {
            title: 'Không đổi',
            value:
              vn30.filter((item) => item['% Tang gia '] === 0)?.length || 0,
          },
        ],
      },
    ];
  }
  public formatExternalItem(item: any) {
    return {
      ticker: item['Ticker'],
      increment: Number(item['% Tang gia ']) * 100,
      value: item[' chenh lech NN MB '],
      symbol: `${item[' SAN TRADINGVIEW ']}:${item['Ticker']}`,
    };
  }
  public getExternalData(rowData: any) {
    let newData = cloneDeep(rowData);
    newData = newData.sort(
      (a, b) => b[' chenh lech NN MB '] - a[' chenh lech NN MB '],
    );
    const max = newData.slice(0, 5);
    const min = newData.slice(newData.length - 5, newData.length);
    return {
      max: max.map(this.formatExternalItem),
      min: min.map(this.formatExternalItem).reverse(),
    };
  }
  public getInternalData(rowData: any) {
    const newData = cloneDeep(rowData);
    const vn30s = newData
      .filter((item) => item[' vn30check '] != '0')
      .map((item) => ({
        ticker: item['Ticker'],
        value: item[' Giá trị GD '],
        increment: rounded(item['% Tang gia '] * 100),
        symbol: `${item[' SAN TRADINGVIEW ']}:${item['Ticker']}`,
      }))
      .sort((a, b) => b['increment'] - a['increment']);
    const max = vn30s.slice(0, 5);
    const min = vn30s.slice(vn30s.length - 5, vn30s.length).reverse();
    return {
      max,
      min,
    };
  }

  public getStrongest(sheet0, sheet2) {
    let newSheet2 = cloneDeep(sheet2);
    newSheet2 = newSheet2
      .sort((a, b) => b['% Thay doi'] - a['% Thay doi'])
      .map((item) => ({
        name: item['Ngành'],
        price: item['Giá trị giao dịch'],
        increment: item['% Thay doi'],
      }));
    const max = newSheet2.slice(0, 3);
    const filter = max.map((item) => {
      const getByTypes = sheet0.filter((child) => child['Ngành'] === item.name);
      const maxByTypes = maxBy(getByTypes, '% Tang gia ');
      return {
        ...item,
        item: {
          ticker: maxByTypes?.Ticker || '',
          increment: maxByTypes?.['% Tang gia '] || '',
          price: maxByTypes?.[' Giá trị GD '] || '',
          symbol: `${maxByTypes[' SAN TRADINGVIEW ']}:${maxByTypes['Ticker']}`,
        },
      };
    });
    return filter;
  }

  public getWeakness(sheet0, sheet2) {
    let newSheet2 = cloneDeep(sheet2);
    newSheet2 = newSheet2
      .sort((a, b) => a['% Thay doi'] - b['% Thay doi'])
      .map((item) => ({
        name: item['Ngành'],
        price: item['Giá trị giao dịch'],
        increment: item['% Thay doi'],
        symbol: `${item[' SAN TRADINGVIEW ']}:${item['Ticker']}`,
      }))
      .filter((item) => item.increment < 0);
    if (newSheet2?.length) {
      const max = newSheet2.slice(0, 3);
      const filter = max.map((item) => {
        const getByTypes = sheet0.filter(
          (child) => child['Ngành'] === item.name,
        );
        const maxByTypes = minBy(getByTypes, '% Tang gia ');
        return {
          ...item,
          item: {
            ticker: maxByTypes?.Ticker || '',
            increment: maxByTypes?.['% Tang gia '] || '',
            price: maxByTypes?.[' Giá trị GD '] || '',
            symbol: `${maxByTypes[' SAN TRADINGVIEW ']}:${maxByTypes['Ticker']}`,
          },
        };
      });
      return filter;
    } else {
      return [];
    }
  }
  public mappingBot(data: any) {
    const newData = [
      {
        a: data?.[0]?.['__EMPTY'],
        b: data?.[0]?.['__EMPTY_1'],
        c: data?.[1]?.['__EMPTY'],
        d: data?.[1]?.['__EMPTY_1'],
        e: data?.[2]?.['__EMPTY'],
        f: data?.[2]?.['__EMPTY_1'],
      },
      {
        a: data?.[0]?.['__EMPTY_2'],
        b: data?.[0]?.['__EMPTY_3'],
        c: data?.[1]?.['__EMPTY_2'],
        d: data?.[1]?.['__EMPTY_3'],
        e: data?.[2]?.['__EMPTY_2'],
        f: data?.[2]?.['__EMPTY_3'],
      },
      {
        a: data?.[0]?.['__EMPTY_4'],
        b: data?.[0]?.['__EMPTY_5'],
        c: data?.[1]?.['__EMPTY_4'],
        d: data?.[1]?.['__EMPTY_5'],
        e: data?.[2]?.['__EMPTY_4'],
        f: data?.[2]?.['__EMPTY_5'],
      },
    ];
    return newData;
  }

  public mappingDJJ(data: any) {
    return data?.[2]?.['__EMPTY_1'];
  }


  public addPrice() {
    return new this.priceModel({
      userId: 'thuyvv',
      remainingPrice: 1_000_000_000,
    }).save();
  }

  public async buy({
    ticker,
    price,
    quantity,
  }: {
    ticker: string;
    price: number;
    quantity: number;
  }) {
    const findTicker = await this.buyModel.findOne({
      ticker: ticker,
    });
    console.log(findTicker);
    if (findTicker) {
      const json = findTicker.toJSON();
      const newPrice =
        (Number(price) * Number(quantity) +
          Number(json.price) * Number(json.quantity)) /
        (Number(quantity) + Number(json.quantity));
      await this.buyModel.updateOne(
        {
          ticker: ticker,
        },
        {
          $set: {
            price: newPrice,
            quantity: Number(quantity) + Number(json.quantity),
          },
        },
      );
      const findPrice = await this.priceModel.findOne({
        userId: 'thuyvv',
      });
      await this.priceModel.updateOne(
        {
          userId: 'thuyvv',
        },

        {
          $set: {
            remainingPrice:
              findPrice.remainingPrice -
              Number(price || 0) * Number(quantity || 0),
          },
        },
      );
      await this.saveBuySellHistory(ticker, price, quantity, 'buy');
      return {
        responseData: true,
      };
    } else {
      const res = await new this.buyModel({
        ticker,
        price,
        quantity,
      }).save();
      if (res) {
        const findPrice = await this.priceModel.findOne({
          userId: 'thuyvv',
        });
        if (findPrice) {
          await this.priceModel.updateOne(
            {
              userId: 'thuyvv',
            },

            {
              $set: {
                remainingPrice:
                  findPrice.remainingPrice - (price || 0) * (quantity || 0),
              },
            },
          );
        }
        await this.saveBuySellHistory(ticker, price, quantity, 'buy');
        return {
          responseData: true,
        };
      } else {
        return {
          error: {
            message: 'Lệnh mua không thành công',
          },
        };
      }
    }
  }

  public async getRemainingPrice() {
    const res = await this.priceModel.findOne({ userId: 'thuyvv' });
    if (res) {
      const obj = res.toJSON();
      return {
        responseData: {
          value: obj.remainingPrice,
        },
      };
    } else {
      return {
        error: {
          message: 'Không tìm thấy sức mua còn lại',
        },
      };
    }
  }

  public async webCrawlerAll({}): Promise<any> {
    return await new Promise((res, rej) => {
      request(`https://iboard.ssi.com.vn/`, async (error, response, html) => {
        if (!error && response.statusCode === HttpStatus.OK) {
          // const $ = cheerio.load(html);
          // const latestPrice = $('.stock-overview .price').text();
          res({
            responseData: html,
          });
        } else {
          console.log(error);
          rej({
            error,
            response,
            html,
          });
        }
      });
    });
  }
  public async getFiveDays(tickers: string) {
    const tickerList = tickers.split(',');
    // const now = new Date();
    // const end = now.setDate(now.getDate() - 1);

    // const start = end.

    // const temp = new Date();
    // temp.setDate(temp.getDate() - 5);
    const temOfEnd = new Date();
    const end = temOfEnd.setDate(temOfEnd.getDate() - 1);
    const temOfStart = new Date(end);
    const start = new Date(temOfStart).setDate(temOfStart.getDate() - 35);
    const response = await Promise.all(
      tickerList.map((item) =>
        fetch(
          `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${Math.ceil(
            start / 1000,
          )}&to=${Math.ceil(end / 1000)}&symbol=${item?.trim()}&resolution=1D`,
          {
            method: 'GET',
            headers: {
              authority: 'services.entrade.com.vn',
              accept: 'application/json, text/plain, */*',
              'accept-language': 'en-US,en;q=0.9',
              dnt: '1',
              origin: 'https://banggia.dnse.com.vn',
              referer: 'https://banggia.dnse.com.vn/',
              'sec-ch-ua':
                '"Edge";v="114", "Chromium";v="114", "Not=A?Brand";v="24"',
              'sec-ch-ua-mobile': '?0',
              'sec-ch-ua-platform': '"Windows"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'cross-site',
              'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1788.0',
            },
          },
        )
          .then((res) => res.json())
          .then((res) => {
            let data = [];
            if (res?.c?.length >= 20) {
              data = res.c.slice(res.c.length - 20, res.c.length);
            }
            return {
              data: Math.max(...data),
              allPrices: data,
              ticker: item,
            };
          }),
      ),
    );
    return response;
  }
  public async crawlerAll(tickers: string) {
    const getData = await fetch(
      `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/second-tc-price?tickers=${tickers}`,
      {
        method: 'get',
        headers: {
          Connection: 'keep-alive',
          'sec-ch-ua':
            '"Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
          DNT: '1',
          'sec-ch-ua-mobile': '?0',
          'X-Fiin-Key': 'KEY',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Fiin-User-ID': 'ID',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
          'X-Fiin-Seed': 'SEED',
          'sec-ch-ua-platform': 'Windows',
          Origin: 'https://iboard.ssi.com.vn',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          Referer: 'https://iboard.ssi.com.vn/',
          'Accept-Language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
        },
      },
    );
    const response = await getData.json();
    if (response) {
      const data = response?.data?.length
        ? response?.data?.map((item) => ({
            ticker: item.t,
            value: item.cp,
          }))
        : [];
      return {
        responseData: {
          data,
        },
      };
    } else {
      return {
        error: {
          message: 'Not found data',
        },
      };
    }
  }

  public async crawlerDetail(ticker: string) {
    const getData = await fetch(
      `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/second-tc-price?tickers=${ticker}`,
      {
        method: 'get',
        headers: {
          Connection: 'keep-alive',
          'sec-ch-ua':
            '"Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
          DNT: '1',
          'sec-ch-ua-mobile': '?0',
          'X-Fiin-Key': 'KEY',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Fiin-User-ID': 'ID',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
          'X-Fiin-Seed': 'SEED',
          'sec-ch-ua-platform': 'Windows',
          Origin: 'https://iboard.ssi.com.vn',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          Referer: 'https://iboard.ssi.com.vn/',
          'Accept-Language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
        },
      },
    );
    const response = await getData.json();
    if (response) {
      const data = response?.data?.length
        ? {
            responseData: {
              value: response.data?.[0]?.cp,
            },
          }
        : {
            error: {
              message: 'Cannot get',
            },
          };
      return data;
    } else {
      return {
        error: {
          message: 'Not found data',
        },
      };
    }
  }

  public async getLeaders() {
    const findAll = await this.buyModel.find();
    const calculate = findAll.map((item) => {
      const newItem = item.toJSON();
      return {
        _id: newItem._id,
        ticker: newItem.ticker,
        percent: Number(newItem.quantity) * Number(newItem.price),
        total: Number(newItem.quantity),
        strategy: newItem.strategy ?? 'short',
        color:
          TICKERS_MAPPINGS()?.find((item) => item.trading === newItem.ticker)
            ?.color || '',
      };
    });
    const sumbOf = calculate.reduce((acc, b) => acc + b.percent, 0);
    const allTickers = calculate.map((item) => item.ticker)?.join(',') || '';
    const crawl = await this.crawlerAll(allTickers);
    const crawlData = crawl?.responseData?.data || [];
    const getTotalPrice = await this.priceModel.findOne({ userId: 'thuyvv' });
    const priceJson = getTotalPrice.toJSON();
    const finalResult = calculate.map((item) => {
      const buyPrice = rounded(item.percent / item.total);
      return {
        ...item,
        profit: Number(
          ((crawlData.find((i) => i.ticker === item.ticker)?.value - buyPrice) /
            buyPrice) *
            100,
        ).toFixed(2),
        percent: Number(
          (item.percent / (sumbOf + Number(priceJson.remainingPrice))) * 100,
        ),
        price: buyPrice,
        profitByOne:
          crawlData.find((i) => i.ticker === item.ticker)?.value * item.total,
      };
    });
    const totalPercent = finalResult.reduce(
      (acc: any, b: any) => acc + (b.percent || 0),
      0,
    );
    const realProfit = finalResult.reduce(
      (acc: any, b: any) => acc + (b.profitByOne || 0),
      0,
    );
    const getMaxInfiveDays = await this.getFiveDays(allTickers);
    // console.log(finalResult, realProfit, totalPercent)
    finalResult.sort((a, b) => b.percent - a.percent);
    finalResult.push({
      ticker: 'Tiền',
      color: '#b9aeae',
      percent: 100 - totalPercent,
    } as any);
    return {
      responseData: {
        prices:
          finalResult
            .map((item) => ({
              ...item,
              percent: item.percent.toFixed(2),
            }))
            .map((item) => ({
              ...item,
              realPrice: crawlData.find((craw) => craw.ticker === item.ticker)
                ?.value,
              maxInFivedays: getMaxInfiveDays?.find(
                (max) => max.ticker === item.ticker,
              )?.data,
              allPricesFrom20days: getMaxInfiveDays.find(
                (max) => max.ticker === item.ticker,
              )?.allPrices,
            })) || [],
        sumAssets: realProfit + Number(priceJson.remainingPrice),
        crawlData,
      },
    };
  }

  public async getBuyersItem() {
    const findAll = await this.buyModel.find();
    const calculate = findAll.map((item) => {
      return {
        ticker: item.ticker,
        total: item.quantity,
        name:
          TICKERS_MAPPINGS().find((item) => item.trading === item.ticker)
            ?.name || '',
      };
    });
    if (calculate) {
      return {
        responseData: calculate,
      };
    } else {
      return {
        error: {
          message: 'Cannot get data',
        },
      };
    }
  }

  public async sell({
    ticker,
    quantity,
    price,
  }: {
    ticker: string;
    quantity: number;
    price: number;
  }) {
    const findTicker = await this.buyModel.findOne({
      ticker: ticker,
    });
    if (findTicker) {
      const json = findTicker.toJSON();
      if (Number(json.quantity) - Number(quantity) === 0) {
        await this.buyModel.deleteOne({
          ticker,
        });
      } else {
        await this.buyModel.updateOne(
          {
            ticker: ticker,
          },
          {
            $set: {
              quantity: Number(json.quantity) - Number(quantity),
            },
          },
        );
      }
      const findPrice = await this.priceModel.findOne({
        userId: 'thuyvv',
      });
      await this.priceModel.updateOne(
        {
          userId: 'thuyvv',
        },

        {
          $set: {
            remainingPrice:
              findPrice.remainingPrice +
              Number(price || 0) * Number(quantity || 0),
          },
        },
      );
      await this.saveBuySellHistory(ticker, price, quantity, 'sell');
      return {
        responseData: true,
      };
    }
  }

  public saveBuySellHistory = async (
    ticker: string,
    price: number,
    quantity: number,
    type: 'buy' | 'sell',
  ) => {
    try {
      console.log(ticker, price, quantity);
      const data = new this.buyHistoryModel({
        ticker,
        quantity,
        price,
        createdAt: new Date(),
        type,
      }).save();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  public async getPercent() {
    const findAll = await this.buyModel.find();
    const calculate = findAll.map((item) => {
      const newItem = item.toJSON();
      return {
        ticker: newItem.ticker,
        percent: Number(newItem.quantity) * Number(newItem.price),
        total: Number(newItem.quantity),
        color:
          TICKERS_MAPPINGS()?.find((item) => item.trading === newItem.ticker)
            ?.color || '',
      };
    });
    const sumbOf = calculate.reduce((acc, b) => acc + b.percent, 0);
    const getTotalPrice = await this.priceModel.findOne({ userId: 'thuyvv' });
    const priceJson = getTotalPrice.toJSON();
    const totalAll = sumbOf + Number(priceJson.remainingPrice);
    return {
      responseData: {
        ck: ((sumbOf / totalAll) * 100).toFixed(2),
        money: (100 - (sumbOf / totalAll) * 100).toFixed(2),
      },
    };
  }

  public async getVNIndex(query) {
    const { fromDate, toDate } = query;
    const url = `https://seekingalpha.com/api/v3/historical_prices?filter[ticker][slug]=vnindex&&filter[as_of_date][gte]=${fromDate}&filter[as_of_date][lte]=${toDate}&sort=as_of_date`;
    console.log(url);
    const response = await fetch(url);
    const data = await response.json();
    return data;
    // try {
    //   const res = await new Promise((res, rej) => {
    //     PythonShell.run('app.py', null).then((messages) => {
    //       if (messages) {
    //         res({
    //           responseData: messages,
    //         });
    //       } else {
    //         res({
    //           error: {
    //             message: 'Cannot get vnindex',
    //           },
    //         });
    //       }
    //     });
    //   });
    //   return res;
    // } catch (error) {
    //   throw error;
    // }
  }
  public async getEffects() {
    const data = await this.historyModel.find();
    return {
      responseData: data || [],
    };
  }

  public async getInvestCategory() {
    const data = await this.buyHistoryModel.find();
    return {
      responseData: data || [],
    };
  }

  public async getInvestHistoryByTicker(ticker: string) {
    const data = await this.buyHistoryModel.find({
      ticker,
    });
    return {
      responseData: data || [],
    };
  }

  public async getT2(ticker: string) {
    const getHistoryOfTicker = await this.buyHistoryModel.find({ ticker });
    return {
      responseData: getHistoryOfTicker || [],
    };
  }

  public async addTodayHistory() {
    const findAll = await this.buyModel.find();
    const calculate = findAll.map((item) => {
      const newItem = item.toJSON();
      return {
        ticker: newItem.ticker,
        total: Number(newItem.quantity),
      };
    });
    const allTickers = calculate.map((item) => item.ticker)?.join(',') || '';
    const crawl = await this.crawlerAll(allTickers);
    const crawlData = crawl?.responseData?.data || [];
    const getTotalPrice = await this.priceModel.findOne({ userId: 'thuyvv' });
    const priceJson = getTotalPrice.toJSON();
    const finalResult = calculate.map((item) => {
      return {
        profitByOne:
          crawlData.find((i) => i.ticker === item.ticker)?.value * item.total,
      };
    });
    const realProfit = finalResult.reduce(
      (acc: any, b: any) => acc + (b.profitByOne || 0),
      0,
    );
    const profit = realProfit + Number(priceJson.remainingPrice);
    await new this.historyModel({
      total: profit,
      createdAt: new Date(),
    }).save();
    return {
      responseData: true,
    };
  }

  public async updateStrategy(id: string, strategy: string) {
    const findPrice = await this.buyModel.findById(id);
    if (findPrice) {
      await this.buyModel.findByIdAndUpdate(id, {
        $set: {
          strategy,
        },
      });
      return {
        responseData: true,
      };
    } else {
      return {
        error: {
          message: 'Không tìm thấy price .',
        },
      };
    }
  }
  public async getBuySellHistory(query: any) {
    let { pageIndex: page, pageSize: size } = query;
    if (!page) page = 1;
    if (!size) size = 10;
    const limit = parseInt(size);
    const skip = (page - 1) * size;

    const po = await this.buyHistoryModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    const total_documents = await this.buyHistoryModel.countDocuments();

    return {
      responseData: {
        page: page,
        size: size,
        data: po,
        totalDocument: total_documents,
      },
    };
  }
}
