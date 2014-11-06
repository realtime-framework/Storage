// -------------------------------------
//  Domain	: Realtime.co
//  Author	: Nicholas Ventimiglia
//  Product	: Messaging and Storage
//  Copyright (c) 2014 IBT  All rights reserved.
//  -------------------------------------
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Realtime.Tasks;
using RealtimeDemos.TerminalConsole;
using RealtimeMessaging.Ibt.Ortc;
using RealtimeStorage.Controllers;
using RealtimeStorage.DataAccess;
using RealtimeStorage.Models;
using UnityEngine;

namespace RealtimeDemos
{
    /// <summary>
    /// Demo Client using the Storage Client
    /// </summary>
    public class StorageTests : MonoBehaviour
    {
        public string AuthKey = "authentication1";

        public bool SingleThreaded = false;

        public string[] Roles;
        
        public class Assert
        {
            public static void IsFalse(bool func, string message)
            {
                if (func)
                    throw new Exception("Assert Failed : " + message);
            }

            public static void IsFalse(Func<bool> func, string message)
            {
                if (func())
                    throw new Exception("Assert Failed : " + message);
            }

            public static void IsTrue(bool func, string message)
            {
                if (!func)
                    throw new Exception("Assert Failed : " + message);
            }

            public static void IsTrue(Func<bool> func, string message)
            {
                if (!func())
                    throw new Exception("Assert Failed : " + message);
            }

            public static void Fail(string message)
            {
                throw new Exception("Assert Failed : " + message);
            }
        }

        [StorageKey("Scores", "UserName", "Points")]
        protected class Score
        {
            public string UserName { get; set; }
            public int Points { get; set; }
            public int Points2 { get; set; }
        }

        [StorageKey("Leaderboard", "BoardId", "Rank")]
        protected class Leaderboard
        {
            public string BoardId { get; set; }
            public int Rank { get; set; }
            public string UserName { get; set; }
            public int Points { get; set; }
        }

        protected StorageRepository Repository;
        protected StorageController Context;

        protected void Awake()
        {
            Terminal.LogInput("RealtimeStorageTest");

            //debug option
            Task.DisableMultiThread = SingleThreaded;
            Task.LogErrors = true;

            Repository = new StorageRepository();

            LoadCommands();
        }

        void LoadCommands()
        {

            Terminal.Add(new TerminalCommand
            {
                Label = "TestAuthentication",
                Method = () => StartCoroutine(TestAuthenticationAsync())
            });

            Terminal.Add(new TerminalCommand
            {
                Label = "Authenticate",
                Method = () => StartCoroutine(AuthenticateAsync())
            });
            Terminal.Add(new TerminalCommand
            {
                Label = "TestRest",
                Method = () => StartCoroutine(TestRestAsync())
            });

            Terminal.Add(new TerminalCommand
            {
                Label = "TestQuery",
                Method = () => StartCoroutine(TestQueryAsync())
            });

            Terminal.Add(new TerminalCommand
            {
                Label = "TestLists",
                Method = () => StartCoroutine(TestListsAsync())
            });

            //
            Terminal.Add(new TerminalCommand
            {
                Label = "TestTables",
                Method = () => StartCoroutine(TestRestTableAsync())
            });
            Terminal.Add(new TerminalCommand
            {
                Label = "TestTableRef",
                Method = () => StartCoroutine(TestTableRefAsync())
            });
            Terminal.Add(new TerminalCommand
            {
                Label = "TestItemRef",
                Method = () => StartCoroutine(TestItemRefAsync())
            });


        }

        #region methods

        IEnumerator AuthenticateAsync()
        {
            Terminal.LogImportant("AuthenticateAsync");

         // get task
            var result1 = Repository.Authenticate(AuthKey, Roles);
            // wait for it
            yield return StartCoroutine(result1.WaitRoutine());
            // client error
            result1.ThrowIfFaulted();
            // server error
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);

            Terminal.LogSuccess("Authenticated");
        }

        IEnumerator TestAuthenticationAsync()
        {
            Terminal.LogImportant("AuthenticateAsync");

            Repository.VerbosLogging = true;

            Terminal.Log("listRoles");
            var result1 = Repository.ListRoles();
            yield return StartCoroutine(result1.WaitRoutine());
            result1.ThrowIfFaulted();
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);

            Terminal.LogSuccess("roles listed "+string.Join(", ", result1.Result.data));

            //
            Terminal.Log("getRoles");
            var result2 = Repository.GetRoles(Roles);
            yield return StartCoroutine(result2.WaitRoutine());
            result2.ThrowIfFaulted();
            if (result2.Result.hasError)
                throw new Exception(result1.Result.error.message);

            var results2Array = result2.Result.data.Select(o => o.name).ToArray();
            Terminal.LogSuccess("roles got " + string.Join(", ", results2Array));


            //
            Terminal.Log("getRole");
            var result3 = Repository.GetRole(Roles.First());
            yield return StartCoroutine(result3.WaitRoutine());
            result3.ThrowIfFaulted();
            if (result3.Result.hasError)
                throw new Exception(result3.Result.error.message);

            Terminal.LogSuccess("role got " + result3.Result.data.name);


            //
            Terminal.Log("isAuthenticated");
            var result4 = Repository.IsAuthenticated();
            yield return StartCoroutine(result4.WaitRoutine());
            result4.ThrowIfFaulted();
            if (result4.Result.hasError)
                throw new Exception(result4.Result.error.message);

            Terminal.LogSuccess("isAuthenticated " + result4.Result.data);
        }


        IEnumerator TestRestAsync()
        {
            Terminal.LogImportant("TestRestAsync");

            var score = new Score
            {
                Points = Strings.RandomNumber(100, 10000),
                Points2 = Strings.RandomNumber(100, 10000),
                UserName = Strings.RandomString(10),
            };

            // CREATE
            Terminal.Log("CREATE");
            // get task
            var result1 = Repository.Create(score);
            // wait for it
            yield return StartCoroutine(result1.WaitRoutine());
            // client error
            result1.ThrowIfFaulted();
            // server error
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);

            //GET
            Terminal.Log("GET 2");
            var result2B = Repository.Get<Score>(score.UserName, score.Points);
            yield return StartCoroutine(result2B.WaitRoutine());
            result2B.ThrowIfFaulted();
            if (result2B.Result.hasError)
                throw new Exception(result2B.Result.error.message);
            var score2 = result2B.Result.data;
            score2.Points += 100;

            //UPDATE
            Terminal.Log("UPDATE");
            var result3 = Repository.Update(score2);
            yield return StartCoroutine(result3.WaitRoutine());
            result3.ThrowIfFaulted();
            if (result3.Result.hasError)
                throw new Exception(result3.Result.error.message);
            var score3 = result3.Result.data;

            //COMPARE 2 and 3
            Assert.IsTrue(score.Points + 100 == score3.Points, "update did not get");

            //DELETE
            Terminal.Log("DELETE");
            var resultd = Repository.Delete(score3);
            yield return StartCoroutine(resultd.WaitRoutine());
            resultd.ThrowIfFaulted();
            if (resultd.Result.hasError)
                throw new Exception(resultd.Result.error.message);

            //GET 3
            Terminal.Log("GET 3");
            var result4 = Repository.Get<Score>(score.UserName, score.Points);
            yield return StartCoroutine(result4.WaitRoutine());
            result4.ThrowIfFaulted();
            if (result4.Result.hasError)
                throw new Exception(result4.Result.error.message);

            // INCR
            Terminal.Log("INCR");
            var result5 = Repository.Incr(score, "Points2");
            yield return StartCoroutine(result5.WaitRoutine());
            result5.ThrowIfFaulted();
            if (result5.Result.hasError)
                throw new Exception(result5.Result.error.message);
            Assert.IsTrue(result5.Result.data.Points2 > score.Points2, "Incr Failed");

            // DECR
            Terminal.Log("DECR");
            var result6 = Repository.Decr(score, "Points2", 2);
            yield return StartCoroutine(result6.WaitRoutine());
            result5.ThrowIfFaulted();
            if (result6.Result.hasError)
                throw new Exception(result6.Result.error.message);
            Assert.IsTrue(result6.Result.data.Points2 < score.Points2, "Decr failed");

            Terminal.LogSuccess("Test Success");
        }

        IEnumerator TestQueryAsync()
        {
            Terminal.LogImportant("TestQueryAsync");

            // populate
            Terminal.Log("populate");
            var items = new List<Leaderboard>();
            for (int i = 0;i < 10;i++)
            {
                var score = new Leaderboard
                {
                    Points = Strings.RandomNumber(100, 10000),
                    UserName = Strings.RandomString(10),
                    BoardId = "HighScores",
                    Rank = i,
                };
                var result = Repository.Create(score);
                yield return StartCoroutine(result.WaitRoutine());
                result.ThrowIfFaulted();
                if (result.Result.hasError)
                    throw new Exception(result.Result.error.message);
                items.Add(result.Result.data);
            }

            // QUERY
            Terminal.Log("QUERY");
            var query1 = new ItemQueryRequest<Leaderboard>("HighScores")
                .Asc()
                .WithProperties(new[] { "Points", "Username", "Rank" })
                .GreaterEqual(2)
                .Limit(5);

            var result1 = Repository.Query(query1);
            yield return StartCoroutine(result1.WaitRoutine());
            result1.ThrowIfFaulted();
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);

            // test filter
            Assert.IsTrue(result1.Result.data.items.First().Rank >= 2, "request has invalid data");

            //QUERY 2
            Terminal.Log("QUERY 2");
            var query2 = new ItemQueryRequest<Leaderboard>("HighScores")
                .Asc()
                .WithProperties(new[] { "Points", "Username", "Rank" })
                .Between(2, 999)
                .Limit(5)
                .WithStartKey(result1.Result.data.stopKey);
            var result2 = Repository.Query(query2);
            yield return StartCoroutine(result2.WaitRoutine());
            result2.ThrowIfFaulted();
            if (result2.Result.hasError)
                throw new Exception(result2.Result.error.message);

            //test filter
            Assert.IsTrue(result2.Result.data.items.First().Rank >= result1.Result.data.items.Last().Rank, "request has invalid data");

            //cleanup
            Terminal.Log("cleanup");
            foreach (var item in items)
            {
                var resultd = Repository.Delete(item);
                yield return StartCoroutine(resultd.WaitRoutine());
                resultd.ThrowIfFaulted();
                if (resultd.Result.hasError)
                    throw new Exception(resultd.Result.error.message);
            }

            Terminal.LogSuccess("Test Success");
        }

        IEnumerator TestListsAsync()
        {

            Terminal.LogImportant("TestListsAsync");

            // populate
            Terminal.Log("populate");
            var items = new List<Leaderboard>();
            for (int i = 0;i < 10;i++)
            {
                var score = new Leaderboard
                {
                    Points = Strings.RandomNumber(100, 10000),
                    UserName = Strings.RandomString(10),
                    BoardId = "HighScores",
                    Rank = i,
                };
                var result = Repository.Create(score);
                yield return StartCoroutine(result.WaitRoutine());
                result.ThrowIfFaulted();
                if (result.Result.hasError)
                    throw new Exception(result.Result.error.message);
                items.Add(result.Result.data);
            }

            // QUERY 1
            Terminal.Log("QUERY");
            var query1 = new ItemListRequest<Leaderboard>()
                .Asc()
                .WithProperties(new[] { "Points", "Username", "Rank" })
                .GreaterEqual("Rank", 2)
                .Limit(5);

            var result1 = Repository.List(query1);
            yield return StartCoroutine(result1.WaitRoutine());
            result1.ThrowIfFaulted();
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);
            Assert.IsTrue(result1.Result.data.items.First().Rank >= 2, "Request has invalid data");

            // QUERY 2
            Terminal.Log("QUERY 2");
            var query2 = new ItemListRequest<Leaderboard>()
                .Asc()
                .WithProperties(new[] { "Points", "Username", "Rank" })
                .Between("Rank", 2, 999)
                .Limit(5)
                .WithStartKey(result1.Result.data.stopKey);

            var result2 = Repository.List(query2);
            yield return StartCoroutine(result2.WaitRoutine());
            result2.ThrowIfFaulted();
            if (result2.Result.hasError)
                throw new Exception(result2.Result.error.message);
            Assert.IsTrue(result2.Result.data.items.First().Rank >= result1.Result.data.items.Last().Rank, "request has invalid data");

            // CLEANUP
            Terminal.Log("cleanup");
            foreach (var item in items)
            {
                var resultd = Repository.Delete(item);
                yield return StartCoroutine(resultd.WaitRoutine());
                resultd.ThrowIfFaulted();
            }

            Terminal.LogSuccess("Test Success");
        }

        IEnumerator TestRestTableAsync()
        {
            Terminal.LogImportant("TestRestTableAsync (This is really slow)");

            // Make Table
            var tableName = Strings.RandomString(10);
            var meta1 = new TableMetadata
            {
                name = tableName,
                provisionLoad = ProvisionLoad.Balanced,
                provisionType = ProvisionType.Custom,
                throughput = new TableThroughput(1, 1),
                key = new TableKey(new Key("ID1", Key.DataType.STRING), new Key("ID2", Key.DataType.NUMBER)),
            };


            //CREATE
            Terminal.Log("CREATE " + tableName);
            var result1 = Repository.CreateTable(meta1);
            yield return StartCoroutine(result1.WaitRoutine());
            result1.ThrowIfFaulted();
            if (result1.Result.hasError)
                throw new Exception(result1.Result.error.message);

            //wait...
            var meta2 = WaitForTable(Repository, tableName);
            yield return StartCoroutine(meta2.WaitRoutine());
            meta2.ThrowIfFaulted();

            //LIST
            Terminal.Log("LIST");
            var result4 = Repository.ListTables();
            yield return StartCoroutine(result4.WaitRoutine());
            result4.ThrowIfFaulted();
            if (result4.Result.hasError)
                throw new Exception(result4.Result.error.message);
            Assert.IsTrue(result4.Result.data.tables.Any(), "request returned no results");

            //UPDATE
            Terminal.Log("UPDATE");
            meta2.Result.throughput = new TableThroughput(2, 2);
            meta2.Result.provisionType = ProvisionType.Custom;
            var result3 = Repository.UpdateTable(meta2.Result);
            yield return StartCoroutine(result3.WaitRoutine());
            result3.ThrowIfFaulted();
            if (result3.Result.hasError)
                throw new Exception(result3.Result.error.message);

            //wait...
            var meta3 = WaitForTable(Repository, tableName, 5000);
            yield return StartCoroutine(meta3.WaitRoutine());
            meta3.ThrowIfFaulted();

            //DELETE
            Terminal.Log("DELETE");
            var result5 = Repository.DeleteTable(tableName);
            yield return StartCoroutine(result5.WaitRoutine());
            result5.ThrowIfFaulted();
            if (result5.Result.hasError)
                throw new Exception(result5.Result.error.message);

            Terminal.LogSuccess("Test Success");
        }

        Task<TableMetadata> WaitForTable(StorageRepository store, string tableName, int timeout = 2500)
        {
            Terminal.Log("Waiting...");
            return Task.Run(() =>
            {
                for (int i = 0;i < 300;i++)
                {

                    var result2 = store.GetTable(tableName);
                    result2.Wait();
                    Assert.IsFalse(result2.IsFaulted, "request failed");

                    var rdy = result2.Result.data.status == TableMetadata.Status.ACTIVE;

                    if (rdy)
                    {
                        return result2.Result.data;
                    }

                    Task.Delay(timeout);
                    Terminal.Log(".");
                }

                Assert.Fail("Table Timeout");
                return null;
            });
        }

        IEnumerator TestTableRefAsync()
        {
            Terminal.LogImportant("TestTableRefAsync");

            if (Context != null)
            {
                if (Context.IsConnected)
                    Context.Disconnect();
                yield return 1;
            }
            
            // Construct
            Context = new StorageController(AuthKey);

            // Wait for Connect
            yield return StartCoroutine(Context.WaitForConnect());

            // get score table
            var tableTask = Context.Table<Score>();
            yield return StartCoroutine(tableTask.WaitRoutine());
            tableTask.ThrowIfFaulted();
            var table = tableTask.Result;

            //Wire listeners
            int callbacks = 0;
            table.On(StorageEventType.DELETE, response =>
            {
                Terminal.Log("DELETE " + response.Val<Score>().UserName);
                callbacks++;
            });

            table.On(StorageEventType.PUT, response =>
            {
                Terminal.Log("PUT " + response.Val<Score>().UserName);
                callbacks++;
            });

            table.On(StorageEventType.UPDATE, response =>
            {
                Terminal.Log("UPDATE " + response.Val<Score>().UserName);
                callbacks++;
            });


            //test
            var score = new Score
            {
                Points = Strings.RandomNumber(100, 10000),
                Points2 = Strings.RandomNumber(100, 10000),
                UserName = Strings.RandomString(10),
            };

            var tresult1 = Context.Repository.Create(score);
            yield return StartCoroutine(tresult1.WaitRoutine());
            tresult1.ThrowIfFaulted();

            var tresult2 = Context.Repository.Update(score);
            yield return StartCoroutine(tresult2.WaitRoutine());
            tresult2.ThrowIfFaulted();

            var tresult3 = Context.Repository.Delete(score);
            yield return StartCoroutine(tresult3.WaitRoutine());
            tresult3.ThrowIfFaulted();

            Terminal.Log("Updates posted. Waiting for response");
            for (int i = 0;i < 10;i++)
            {
                if (callbacks >= 3)
                    break;

                yield return new WaitForSeconds(2.5f);
                Terminal.Log(".");
            }

            if (callbacks < 3)
                Debug.LogWarning("Failed to get all update messages. This sometimes happens, please try again.");
            else
                Terminal.LogSuccess("Test Success");
        }

        IEnumerator TestItemRefAsync()
        {
            Terminal.LogImportant("TestItemRefAsync");


            if (Context != null)
            {
                if (Context.IsConnected)
                    Context.Disconnect();
                yield return 1;
            }

            // Construct
            Context = new StorageController(AuthKey);

            // Wait for Connect
            yield return StartCoroutine(Context.WaitForConnect());

            // get score table
            var tableTask = Context.Table<Score>();
            yield return StartCoroutine(tableTask.WaitRoutine());
            tableTask.ThrowIfFaulted();
            var table = tableTask.Result;


            // create a score
            var score = new Score
            {
                Points = Strings.RandomNumber(100, 10000),
                Points2 = Strings.RandomNumber(100, 10000),
                UserName = Strings.RandomString(10),
            };
            var tresult1 = Context.Repository.Create(score);
            yield return StartCoroutine(tresult1.WaitRoutine());
            tresult1.ThrowIfFaulted();
            var result1 = tresult1.Result;

            // get ref
            var item = table.Item(result1.data);

            // wire
            int callbacks = 0;
            item.On(StorageEventType.DELETE, response =>
            {
                Terminal.Log("DELETE " + response.Val<Score>().UserName);
                callbacks++;
            });

            item.On(StorageEventType.PUT, response =>
            {
                Terminal.Log("PUT " + response.Val<Score>().UserName);
                callbacks++;
            });

            item.On(StorageEventType.UPDATE, response =>
            {
                Terminal.Log("UPDATE " + response.Val<Score>().UserName);
                callbacks++;
            });

            //update
            item.Set();
            item.Incr("Points2");
            item.Decr("Points2");
            item.Del();

            //wait
            Terminal.Log("Updates posted. Waiting for response");
            for (int i = 0;i < 10;i++)
            {
                if (callbacks >= 3)
                    break;

                yield return new WaitForSeconds(2.5f);
                Terminal.Log(".");
            }

            if (callbacks < 4)
                Debug.LogWarning("Failed to get all update messages. This sometimes happens, please try again.");

            else
                Terminal.LogSuccess("Test Success");
        }
        #endregion
    }
}
