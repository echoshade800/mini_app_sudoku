/**
 * localStorage 工具类
 * 提供读取和写入localStorage数据的便捷方法
 */
class StorageUtils {
  static readonly miniAppName: string = 'SudokuMiniApp';

  /**
   * 从localStorage读取数据
   * @returns 解析后的数据，如果不存在则返回null
   */
  static getData(): any | null {
    try {
      console.log('get data from storage', `${this.miniAppName}info`);
      const savedData = localStorage.getItem(`${this.miniAppName}info`);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return null;
    } catch (error) {
      console.error('读取localStorage数据失败:', error);
      return null;
    }
  }

  /**
   * 向localStorage写入数据（支持数据合并）
   * @param newData - 要存储的新数据
   * @returns 是否写入成功
   */
  static setData(newData: any): boolean {
    try {
      console.log('set data to storage', `${this.miniAppName}info`);
      // 先读取老数据
      const oldData = this.getData();
      
      // 如果老数据存在，使用解构方式合并数据，新数据会覆盖老数据中的相同字段
      const mergedData = oldData ? { ...oldData, ...newData } : newData;
      
      // 保存合并后的数据
      localStorage.setItem(`${this.miniAppName}info`, JSON.stringify(mergedData));
      return true;
    } catch (error) {
      console.error('设置info信息失败:', error);
      return false;
    }
  }

  /**
   * 删除localStorage中的数据
   * @returns 是否删除成功
   */
  static removeData(): boolean {
    try {
      localStorage.removeItem(`${this.miniAppName}info`);
      return true;
    } catch (error) {
      console.error('删除localStorage数据失败:', error);
      return false;
    }
  }

  /**
   * 清空所有localStorage数据
   * @returns 是否清空成功
   */
  static clearAll(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('清空localStorage数据失败:', error);
      return false;
    }
  }
}

export default StorageUtils
